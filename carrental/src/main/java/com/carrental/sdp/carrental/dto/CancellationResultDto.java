package com.carrental.sdp.carrental.dto;

import com.carrental.sdp.carrental.model.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

/** Response of DELETE /api/bookings/{id}: what happened to the booking and the money. */
@Getter
@AllArgsConstructor
public class CancellationResultDto {
    private UUID bookingId;
    private BookingStatus status;
    /** Amount refunded to the customer (0 for unpaid bookings). */
    private double refundAmount;
    /** Amount kept as a cancellation fee (only within 48h of pickup). */
    private double cancellationFee;
    /** Razorpay refund reference, null when nothing was refunded. */
    private String refundId;
    private boolean emailSent;
    private String message;
}
