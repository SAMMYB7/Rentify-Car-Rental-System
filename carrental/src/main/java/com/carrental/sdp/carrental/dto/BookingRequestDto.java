package com.carrental.sdp.carrental.dto;

import java.util.UUID;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

import lombok.Data;

@Data
public class BookingRequestDto {
    @NotNull
    private UUID carId;

    @NotNull
    @FutureOrPresent
    private LocalDate startDate;

    @NotNull
    @FutureOrPresent
    private LocalDate endDate;
}
