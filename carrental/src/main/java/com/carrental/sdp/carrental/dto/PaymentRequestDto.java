package com.carrental.sdp.carrental.dto;

import java.util.UUID;

import lombok.Data;

@Data
public class PaymentRequestDto {
    private UUID bookingId;
}
