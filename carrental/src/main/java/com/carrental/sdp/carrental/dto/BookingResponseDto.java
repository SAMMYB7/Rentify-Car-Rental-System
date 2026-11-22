package com.carrental.sdp.carrental.dto;

import java.util.UUID;

import com.carrental.sdp.carrental.model.Booking;
import com.carrental.sdp.carrental.model.BookingStatus;
import com.carrental.sdp.carrental.service.CancellationPolicy;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookingResponseDto {
    private UUID id;
    private UUID userId;
    private UUID carId;
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

    /** Unpaid bookings must be paid before this moment (null once paid or cancelled). */
    private LocalDateTime paymentDueAt;
    private LocalDateTime cancelledAt;
    /** Amount refunded for a cancelled paid booking. */
    private Double refundAmount;

    /** What the renter may do right now (from CancellationPolicy) and what cancelling would refund. */
    private boolean editable;
    private boolean cancellable;
    private Double refundIfCancelled;
    private Double cancellationFee;
    private String cancellationNote;

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
        dto.setPaymentDueAt(booking.getStatus() == BookingStatus.BOOKED ? booking.getPaymentDueAt() : null);
        dto.setCancelledAt(booking.getCancelledAt());
        dto.setRefundAmount(booking.getRefundAmount());

        CancellationPolicy.Quote quote = CancellationPolicy.evaluate(booking, LocalDateTime.now(), false);
        dto.setEditable(quote.editable());
        dto.setCancellable(quote.cancellable());
        dto.setRefundIfCancelled(quote.refund());
        dto.setCancellationFee(quote.fee());
        dto.setCancellationNote(quote.note());
        return dto;
    }
}
