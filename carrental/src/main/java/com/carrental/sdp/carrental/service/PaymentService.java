package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.dto.PaymentResponseDto;
import com.carrental.sdp.carrental.model.User;
import java.util.List;

public interface PaymentService {
    PaymentResponseDto createPaymentOrder(Long bookingId, Long userId);
    void verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature, User user);
    PaymentResponseDto getPaymentByBooking(Long bookingId, User user);
    List<PaymentResponseDto> getPaymentsForUser(Long userId);
    List<PaymentResponseDto> getAllPayments();
}
