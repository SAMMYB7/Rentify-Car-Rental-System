package com.carrental.sdp.carrental.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {
    private Long id;
    private int rating;
    private String comment;
    private Long carId;
    private String carModel;
    private String username;
    private LocalDateTime createdAt;
}
