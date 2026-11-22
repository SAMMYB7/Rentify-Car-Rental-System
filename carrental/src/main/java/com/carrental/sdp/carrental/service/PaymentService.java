package com.carrental.sdp.carrental.service;

import java.util.UUID;

import com.carrental.sdp.carrental.dto.PaymentResponseDto;
import com.carrental.sdp.carrental.model.Booking;
import com.carrental.sdp.carrental.model.User;
import java.util.List;

public interface PaymentService {

    /** Result of verifying a Razorpay payment. */
    enum VerificationOutcome {
        /** Payment confirmed and the booking is now PAID (first verification). */
        VERIFIED,
        /** This payment had already been verified earlier (harmless retry). */
        ALREADY_VERIFIED,
        /** The booking was released/cancelled while the user was paying; the full amount was refunded. */
        BOOKING_UNAVAILABLE_REFUNDED,
        /** Same as above, but the automatic refund failed; support must refund manually. */
        BOOKING_UNAVAILABLE_REFUND_FAILED
    }

    /** A refund that was issued through Razorpay. refundId is null when the amount was 0. */
    record RefundResult(String refundId, double amount) {
    }

    PaymentResponseDto createPaymentOrder(UUID bookingId, UUID userId);

    VerificationOutcome verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature, User user);

    /**
     * Refunds `amount` of the booking's successful payment through Razorpay and records it on the payment.
     *
     * @throws org.springframework.web.server.ResponseStatusException 502 if Razorpay refuses the refund
     */
    RefundResult refundForCancellation(Booking booking, double amount);

    PaymentResponseDto getPaymentByBooking(UUID bookingId, User user);
    List<PaymentResponseDto> getPaymentsForUser(UUID userId);
    List<PaymentResponseDto> getAllPayments();
}
