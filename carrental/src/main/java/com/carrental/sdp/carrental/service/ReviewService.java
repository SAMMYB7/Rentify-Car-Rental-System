package com.carrental.sdp.carrental.service;

import java.util.UUID;

import com.carrental.sdp.carrental.dto.ReviewRequestDTO;
import com.carrental.sdp.carrental.dto.ReviewResponseDTO;

import java.util.List;

public interface ReviewService {
    ReviewResponseDTO addReview(ReviewRequestDTO dto, String username);
    List<ReviewResponseDTO> getReviewsByCarId(UUID carId);
}
