package com.carrental.sdp.carrental.dto;

import java.util.UUID;

import lombok.Data;

@Data
public class CarResponseDTO {
    private UUID id;
    private String model;
    private String brand;
    private String type;
    private Double pricePerDay;
    private boolean available;
    private String description;
    private String imageUrl;
}
