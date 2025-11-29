package com.carrental.sdp.carrental.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Data
public class CarRequestDTO {
    @NotBlank
    private String model;

    @NotBlank
    private String brand;

    @NotBlank
    private String type;

    @NotNull
    @Positive
    private Double pricePerDay;

    @NotNull
    private boolean available;

    @NotBlank
    private String description;
}
