package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.dto.BookingRequestDto;
import com.carrental.sdp.carrental.dto.BookingResponseDto;
import com.carrental.sdp.carrental.model.*;
import com.carrental.sdp.carrental.repository.BookingRepository;
import com.carrental.sdp.carrental.repository.CarRepository;
import com.carrental.sdp.carrental.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final EmailService emailService; // used by the (currently disabled) booking confirmation email

    @Override
    @Transactional
    public BookingResponseDto createBooking(Long userId, BookingRequestDto dto) {
        Car car = carRepository.findById(dto.getCarId())
                .orElseThrow(() -> new EntityNotFoundException("Car not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        validateDateOrder(dto);
        if (hasOverlap(car, dto.getStartDate(), dto.getEndDate(), null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Car is not available for those dates.");
        }

        Booking booking = Booking.builder()
                .car(car)
                .user(user)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .status(BookingStatus.BOOKED)
                .build();

        Booking saved = bookingRepository.save(booking);

        // Prepare email details (total price: saved.totalPrice())
        // String to = saved.getUser().getEmail();
        // String subject = "Booking Confirmation - Car Rental";
        // String text = String.format(
        //     "Dear %s,\n\nYour booking is confirmed!\n\nCar: %s\nFrom: %s\nTo: %s\nTotal Price: ₹%.2f\n\nThank you for choosing us!",
        //     saved.getUser().getName(),
        //     saved.getCar().getModel(),
        //     saved.getStartDate(),
        //     saved.getEndDate(),
        //     totalPrice
        // );
        // emailService.sendSimpleEmail(to, subject, text);

        return toDto(saved);
    }

    @Override
    @Transactional
    public BookingResponseDto modifyBooking(Long bookingId, Long userId, BookingRequestDto dto) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only change your own bookings.");
        }
        // Paid bookings would need a re-payment/refund for a new price; cancelled/completed are final.
        if (booking.getStatus() != BookingStatus.BOOKED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only unpaid bookings can be changed (status: " + booking.getStatus() + ").");
        }
        if (dto.getCarId() != null && !dto.getCarId().equals(booking.getCar().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The car of a booking cannot be changed. Cancel it and book the other car instead.");
        }
        validateDateOrder(dto);
        // Exclude this booking itself, otherwise it always "overlaps" with its own old dates.
        if (hasOverlap(booking.getCar(), dto.getStartDate(), dto.getEndDate(), booking.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Car is not available for those dates.");
        }

        booking.setStartDate(dto.getStartDate());
        booking.setEndDate(dto.getEndDate());
        Booking updated = bookingRepository.save(booking);
        return toDto(updated);
    }

    @Override
    @Transactional
    public void cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Allow if booking owner or admin
        if (!booking.getUser().getId().equals(userId) && user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings.");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This booking is already " + booking.getStatus().name().toLowerCase() + ".");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    @Override
    public boolean isCarAvailable(Long carId, LocalDate start, LocalDate end) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new EntityNotFoundException("Car not found"));
        return !hasOverlap(car, start, end, null);
    }

    /** Overlap with any non-cancelled booking of the car, optionally ignoring one booking. */
    private boolean hasOverlap(Car car, LocalDate start, LocalDate end, Long excludedBookingId) {
        return excludedBookingId == null
                ? bookingRepository.existsByCarAndStatusNotAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        car, BookingStatus.CANCELLED, end, start)
                : bookingRepository.existsByCarAndStatusNotAndIdNotAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        car, BookingStatus.CANCELLED, excludedBookingId, end, start);
    }

    private static void validateDateOrder(BookingRequestDto dto) {
        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Start date must be before or equal to end date.");
        }
    }

    @Override
    public List<BookingResponseDto> getUserBookings(Long userId) {
        User user = userRepository.findById(userId)
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
