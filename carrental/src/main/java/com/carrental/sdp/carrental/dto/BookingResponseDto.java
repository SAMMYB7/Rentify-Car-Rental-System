package com.carrental.sdp.carrental.dto;

import com.carrental.sdp.carrental.model.Booking;
import com.carrental.sdp.carrental.model.BookingStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookingResponseDto {
    private Long id;
    private Long userId;
    private Long carId;
    private String carModel;
    private String carBrand;
    private LocalDate startDate;
    private LocalDate endDate;
    private BookingStatus status;
    private Double pricePerDay;
    private Long rentalDays;
    private Double totalPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BookingResponseDto from(Booking booking) {
        BookingResponseDto dto = new BookingResponseDto();
        dto.setId(booking.getId());
        dto.setUserId(booking.getUser().getId());
        dto.setCarId(booking.getCar().getId());
        dto.setCarModel(booking.getCar().getModel());
        dto.setCarBrand(booking.getCar().getBrand());
        dto.setStartDate(booking.getStartDate());
        dto.setEndDate(booking.getEndDate());
        dto.setStatus(booking.getStatus());
        dto.setPricePerDay(booking.getCar().getPricePerDay());
        dto.setRentalDays(booking.rentalDays());
        dto.setTotalPrice(booking.totalPrice());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }
}
