package com.carrental.sdp.carrental.controller;

import com.carrental.sdp.carrental.dto.ReviewRequestDTO;
import com.carrental.sdp.carrental.dto.ReviewResponseDTO;
import com.carrental.sdp.carrental.service.ReviewService;
import com.carrental.sdp.carrental.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ReviewResponseDTO addReview(@Valid @RequestBody ReviewRequestDTO dto, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return reviewService.addReview(dto, user.getEmail());
    }

    @GetMapping
    public List<ReviewResponseDTO> getReviews(@RequestParam Long carId) {
        return reviewService.getReviewsByCarId(carId);
    }
}
