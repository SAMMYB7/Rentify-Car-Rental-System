package com.carrental.sdp.carrental.service;

import java.util.UUID;

import com.carrental.sdp.carrental.dto.PaymentResponseDto;
import com.carrental.sdp.carrental.model.User;
import java.util.List;

public interface PaymentService {
    PaymentResponseDto createPaymentOrder(UUID bookingId, UUID userId);
    void verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature, User user);
    PaymentResponseDto getPaymentByBooking(UUID bookingId, User user);
    List<PaymentResponseDto> getPaymentsForUser(UUID userId);
    List<PaymentResponseDto> getAllPayments();
}
