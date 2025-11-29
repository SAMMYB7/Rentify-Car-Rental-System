package com.carrental.sdp.carrental.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponseDto {
    private String orderId;
    private Double amount;
    private String currency;
    private String key; // Razorpay key_id for frontend

    // Add these fields:
    private String status;
    private Long bookingId;
    private String userEmail;
    private LocalDateTime paymentTime;
}
