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
        boolean newlyVerified = paymentService.verifyPayment(
                orderId,
                payload.get("razorpay_payment_id"),
                payload.get("razorpay_signature"),
                user);

        // Only the first successful verification sends the invoice (retries must not spam the user).
        boolean invoiceEmailed = newlyVerified && bookingConfirmationService.sendInvoiceEmail(orderId);

        return ResponseEntity.ok(Map.of(
                "message", newlyVerified ? "Payment verified successfully." : "Payment was already verified.",
                "alreadyVerified", !newlyVerified,
                "invoiceEmailed", invoiceEmailed));
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
