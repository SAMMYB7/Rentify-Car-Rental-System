package com.carrental.sdp.carrental.controller;

import com.carrental.sdp.carrental.dto.PaymentRequestDto;
import com.carrental.sdp.carrental.dto.PaymentResponseDto;
import com.carrental.sdp.carrental.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import com.razorpay.Utils;
import com.carrental.sdp.carrental.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${razorpay.key_secret}")
    private String razorpaySecret;

    // Create Razorpay order for a booking
    @PostMapping("/create")
    public ResponseEntity<PaymentResponseDto> createPaymentOrder(@RequestBody PaymentRequestDto request) {
        PaymentResponseDto response = paymentService.createPaymentOrder(request.getBookingId());
        return ResponseEntity.ok(response);
    }

    // Payment verification endpoint
    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(@RequestBody Map<String, String> payload) {
        String razorpayOrderId = payload.get("razorpay_order_id");
        String razorpayPaymentId = payload.get("razorpay_payment_id");
        String razorpaySignature = payload.get("razorpay_signature");

        try {
            org.json.JSONObject params = new org.json.JSONObject();
            params.put("razorpay_order_id", razorpayOrderId);
            params.put("razorpay_payment_id", razorpayPaymentId);
            params.put("razorpay_signature", razorpaySignature);

            com.razorpay.Utils.verifyPaymentSignature(params, razorpaySecret);

            paymentService.updatePaymentStatus(razorpayOrderId, "SUCCESS");
            return ResponseEntity.ok("Payment verified and marked as SUCCESS");
        } catch (Exception e) {
            paymentService.updatePaymentStatus(razorpayOrderId, "FAILED");
            return ResponseEntity.status(400).body("Payment verification failed: " + e.getMessage());
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentResponseDto> getPaymentByBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        PaymentResponseDto response = paymentService.getPaymentByBooking(bookingId, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<PaymentResponseDto>> getMyPayments(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<PaymentResponseDto> payments = paymentService.getPaymentsForUser(user.getId());
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponseDto>> getAllPayments() {
        List<PaymentResponseDto> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }
}
