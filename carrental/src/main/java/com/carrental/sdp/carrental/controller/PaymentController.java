package com.carrental.sdp.carrental.controller;

import java.util.UUID;

import com.carrental.sdp.carrental.dto.PaymentRequestDto;
import com.carrental.sdp.carrental.dto.PaymentResponseDto;
import com.carrental.sdp.carrental.model.User;
import com.carrental.sdp.carrental.service.BookingConfirmationService;
import com.carrental.sdp.carrental.service.InvoiceService;
import com.carrental.sdp.carrental.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final BookingConfirmationService bookingConfirmationService;
    private final InvoiceService invoiceService;

    // Create (or reuse) a Razorpay order for one of the caller's own bookings
    @PostMapping("/create")
    public ResponseEntity<PaymentResponseDto> createPaymentOrder(
            @RequestBody PaymentRequestDto request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(paymentService.createPaymentOrder(request.getBookingId(), user.getId()));
    }

    // Verify the Razorpay signature for one of the caller's own orders, then email the invoice.
    // The payment is committed first; the email can fail without affecting the confirmed payment.
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal User user) {
        String orderId = payload.get("razorpay_order_id");
        PaymentService.VerificationOutcome outcome = paymentService.verifyPayment(
                orderId,
                payload.get("razorpay_payment_id"),
                payload.get("razorpay_signature"),
                user);

        return switch (outcome) {
            case VERIFIED -> ResponseEntity.ok(Map.of(
                    "message", "Payment verified successfully.",
                    "alreadyVerified", false,
                    // Only the first successful verification sends the invoice (retries must not spam the user).
                    "invoiceEmailed", bookingConfirmationService.sendInvoiceEmail(orderId)));
            case ALREADY_VERIFIED -> ResponseEntity.ok(Map.of(
                    "message", "Payment was already verified.",
                    "alreadyVerified", true,
                    "invoiceEmailed", false));
            case BOOKING_UNAVAILABLE_REFUNDED -> ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "message", "Your booking expired before the payment completed, so the full amount has been "
                            + "refunded to your original payment method. Please book again.",
                    "refunded", true));
            case BOOKING_UNAVAILABLE_REFUND_FAILED -> ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "message", "Your booking expired before the payment completed and the automatic refund "
                            + "failed. Please contact support with your payment ID so we can refund you.",
                    "refunded", false));
        };
    }

    // Download the PDF invoice of a paid booking (booking owner or admin)
    @GetMapping("/booking/{bookingId}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal User user) {
        InvoiceService.InvoiceFile invoice = invoiceService.getInvoiceForBooking(bookingId, user);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(invoice.fileName()).build().toString())
                .body(invoice.content());
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentResponseDto> getPaymentByBooking(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(paymentService.getPaymentByBooking(bookingId, user));
    }

    @GetMapping("/my")
    public ResponseEntity<List<PaymentResponseDto>> getMyPayments(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(paymentService.getPaymentsForUser(user.getId()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponseDto>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
}
