package com.carrental.sdp.carrental.dto;

import java.util.UUID;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {
    private UUID id;
    private int rating;
    private String comment;
    private UUID carId;
    private String carModel;
    private String username;
    private LocalDateTime createdAt;
}
