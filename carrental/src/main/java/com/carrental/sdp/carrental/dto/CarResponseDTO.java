package com.carrental.sdp.carrental.dto;

import lombok.Data;

@Data
public class CarResponseDTO {
    private Long id;
    private String model;
    private String brand;
    private String type;
    private Double pricePerDay;
    private boolean available;
    private String description;
    private String imageUrl;
}
