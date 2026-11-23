package com.carrental.sdp.carrental.service;

import java.util.UUID;

import com.carrental.sdp.carrental.dto.BookingRequestDto;
import com.carrental.sdp.carrental.dto.BookingResponseDto;
import com.carrental.sdp.carrental.dto.CancellationResultDto;
import com.carrental.sdp.carrental.model.*;
import com.carrental.sdp.carrental.repository.BookingRepository;
import com.carrental.sdp.carrental.repository.CarRepository;
import com.carrental.sdp.carrental.repository.PaymentRepository;
import com.carrental.sdp.carrental.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;
    private final BookingConfirmationService bookingConfirmationService;

    /** How long an unpaid booking holds the car before it is released automatically. */
    @Value("${app.booking.unpaid-hold-minutes:30}")
    private long unpaidHoldMinutes;

    @Override
    @Transactional
    public BookingResponseDto createBooking(UUID userId, BookingRequestDto dto) {
        if (dto.getCarId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please choose a car to book.");
        }
        Car car = carRepository.findById(dto.getCarId())
                .orElseThrow(() -> new EntityNotFoundException("Car not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        validateDateOrder(dto);
        if (hasOverlap(car, dto.getStartDate(), dto.getEndDate(), null)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This car is already booked for some of those dates. Please choose different dates.");
        }

        Booking booking = Booking.builder()
                .car(car)
                .user(user)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .status(BookingStatus.BOOKED)
                // Unpaid bookings hold the car only for a short time, so abandoned bookings don't block it.
                .paymentDueAt(LocalDateTime.now().plusMinutes(unpaidHoldMinutes))
                .build();

        return toDto(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponseDto modifyBooking(UUID bookingId, UUID userId, BookingRequestDto dto) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only change your own bookings.");
        }
        if (booking.getStatus() == BookingStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Paid bookings can't change dates. Cancel this booking (refund per our policy) and book again.");
        }
        CancellationPolicy.Quote quote = CancellationPolicy.evaluate(booking, LocalDateTime.now(), false);
        if (!quote.editable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, quote.note());
        }
        if (booking.getPaymentDueAt() != null && LocalDateTime.now().isAfter(booking.getPaymentDueAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This unpaid booking has expired. Please book the car again.");
        }
        if (dto.getCarId() != null && !dto.getCarId().equals(booking.getCar().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The car of a booking cannot be changed. Cancel it and book the other car instead.");
        }
        validateDateOrder(dto);
        // Exclude this booking itself, otherwise it always "overlaps" with its own old dates.
        if (hasOverlap(booking.getCar(), dto.getStartDate(), dto.getEndDate(), booking.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This car is already booked for some of those dates. Please choose different dates.");
        }

        booking.setStartDate(dto.getStartDate());
        booking.setEndDate(dto.getEndDate());
        return toDto(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public CancellationResultDto cancelBooking(UUID bookingId, UUID userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        boolean isOwner = booking.getUser().getId().equals(userId);
        boolean byAdmin = user.getRole() == Role.ADMIN;
        if (!isOwner && !byAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings.");
        }

        CancellationPolicy.Quote quote = CancellationPolicy.evaluate(booking, LocalDateTime.now(), byAdmin);
        if (!quote.cancellable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, quote.note());
        }

        boolean wasPaid = booking.getStatus() == BookingStatus.PAID;
        PaymentService.RefundResult refund = new PaymentService.RefundResult(null, 0);
        if (wasPaid) {
            // Refund FIRST: if Razorpay refuses, this throws and the booking stays as it is.
            refund = paymentService.refundForCancellation(booking, quote.refund());
            booking.setRefundAmount(refund.amount());
        } else {
            // Unpaid: retire any open checkout orders so they can't be paid later.
            paymentRepository.findByBookingAndStatusIn(booking, EnumSet.of(PaymentStatus.PENDING))
                    .forEach(p -> p.setStatus(PaymentStatus.FAILED));
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setPaymentDueAt(null);
        bookingRepository.save(booking);

        double fee = wasPaid ? quote.fee() : 0;
        boolean emailSent = bookingConfirmationService.sendCancellationEmail(
                booking, wasPaid, refund.amount(), fee, refund.refundId(), byAdmin && !isOwner);

        String message;
        if (!wasPaid) {
            message = "Your booking has been cancelled.";
        } else if (refund.amount() > 0) {
            message = String.format("Your booking has been cancelled. A refund of ₹%.2f has been initiated.",
                    refund.amount());
        } else {
            message = "Your booking has been cancelled. No refund applies (cancellation fee).";
        }
        return new CancellationResultDto(booking.getId(), booking.getStatus(), refund.amount(), fee,
                refund.refundId(), emailSent, message);
    }

    @Override
    public boolean isCarAvailable(UUID carId, LocalDate start, LocalDate end) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new EntityNotFoundException("Car not found"));
        return !hasOverlap(car, start, end, null);
    }

    /** Overlap with any non-cancelled booking of the car, optionally ignoring one booking. */
    private boolean hasOverlap(Car car, LocalDate start, LocalDate end, UUID excludedBookingId) {
        return excludedBookingId == null
                ? bookingRepository.existsByCarAndStatusNotAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        car, BookingStatus.CANCELLED, end, start)
                : bookingRepository.existsByCarAndStatusNotAndIdNotAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        car, BookingStatus.CANCELLED, excludedBookingId, end, start);
    }

    /** Both dates present, pickup not in the past, return on or after pickup. */
    private static void validateDateOrder(BookingRequestDto dto) {
        if (dto.getStartDate() == null || dto.getEndDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please choose both a pick-up and a return date.");
        }
        if (dto.getStartDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The pick-up date can't be in the past.");
        }
        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The return date must be on or after the pick-up date.");
        }
    }

    @Override
    public List<BookingResponseDto> getUserBookings(UUID userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return bookingRepository.findAll().stream()
                .filter(b -> b.getUser().getId().equals(userId))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDto> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private BookingResponseDto toDto(Booking booking) {
        return BookingResponseDto.from(booking);
    }
}
