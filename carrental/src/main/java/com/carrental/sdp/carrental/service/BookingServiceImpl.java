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
    private final EmailService emailService; // <-- Add this line

    @Override
    @Transactional
    public BookingResponseDto createBooking(Long userId, BookingRequestDto dto) {
        Car car = carRepository.findById(dto.getCarId())
                .orElseThrow(() -> new EntityNotFoundException("Car not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!isCarAvailable(car.getId(), dto.getStartDate(), dto.getEndDate())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Car is not available for those dates."
            );
        }
        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Start date must be before or equal to end date."
            );
        }

        Booking booking = Booking.builder()
                .car(car)
                .user(user)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .status(BookingStatus.BOOKED)
                .build();

        Booking saved = bookingRepository.save(booking);

        // Calculate total price
        long days = java.time.temporal.ChronoUnit.DAYS.between(saved.getStartDate(), saved.getEndDate()) + 1;
        double totalPrice = saved.getCar().getPricePerDay() * days;

        // Prepare email details
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
            throw new RuntimeException("Unauthorized");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot modify a completed booking.");
        }
        if (!isCarAvailable(booking.getCar().getId(), dto.getStartDate(), dto.getEndDate())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Car is not available for those dates."
            );
        }
        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Start date must be before or equal to end date."
            );
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

        // Fetch the user (you may need to inject UserRepository if not already)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Allow if booking owner or admin
        if (!booking.getUser().getId().equals(userId) && !user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Unauthorized");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed booking.");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    @Override
    public boolean isCarAvailable(Long carId, LocalDate start, LocalDate end) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new EntityNotFoundException("Car not found"));
        return !bookingRepository.existsByCarAndStatusNotAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                car, BookingStatus.CANCELLED, end, start
        );
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
        BookingResponseDto dto = new BookingResponseDto();
        dto.setId(booking.getId());
        dto.setUserId(booking.getUser().getId());
        dto.setCarId(booking.getCar().getId());
        dto.setCarModel(booking.getCar().getModel());
        dto.setStartDate(booking.getStartDate());
        dto.setEndDate(booking.getEndDate());
        dto.setStatus(booking.getStatus());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }
}
