package com.carrental.sdp.carrental.controller;

import com.carrental.sdp.carrental.dto.PaymentRequestDto;
import com.carrental.sdp.carrental.dto.PaymentResponseDto;
import com.carrental.sdp.carrental.model.User;
import com.carrental.sdp.carrental.service.PaymentService;
import lombok.RequiredArgsConstructor;
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

    // Create (or reuse) a Razorpay order for one of the caller's own bookings
    @PostMapping("/create")
    public ResponseEntity<PaymentResponseDto> createPaymentOrder(
            @RequestBody PaymentRequestDto request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(paymentService.createPaymentOrder(request.getBookingId(), user.getId()));
    }

    // Verify the Razorpay signature for one of the caller's own orders
    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyPayment(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal User user) {
        paymentService.verifyPayment(
                payload.get("razorpay_order_id"),
                payload.get("razorpay_payment_id"),
                payload.get("razorpay_signature"),
                user);
        return ResponseEntity.ok(Map.of("message", "Payment verified successfully."));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentResponseDto> getPaymentByBooking(
            @PathVariable Long bookingId,
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
