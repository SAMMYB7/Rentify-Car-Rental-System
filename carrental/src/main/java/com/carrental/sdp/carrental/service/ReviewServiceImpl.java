package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.dto.ReviewRequestDTO;
import com.carrental.sdp.carrental.dto.ReviewResponseDTO;
import com.carrental.sdp.carrental.model.Car;
import com.carrental.sdp.carrental.model.Review;
import com.carrental.sdp.carrental.model.User;
import com.carrental.sdp.carrental.repository.CarRepository;
import com.carrental.sdp.carrental.repository.ReviewRepository;
import com.carrental.sdp.carrental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    @Override
    public ReviewResponseDTO addReview(ReviewRequestDTO dto, String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Car car = carRepository.findById(dto.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found"));

        Review review = Review.builder()
                .car(car)
                .user(user)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .build();

        Review saved = reviewRepository.save(review);

        return ReviewResponseDTO.builder()
                .id(saved.getId())
                .rating(saved.getRating())
                .comment(saved.getComment())
                .carId(car.getId())
                .carModel(car.getModel())
                .username(user.getName())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    public List<ReviewResponseDTO> getReviewsByCarId(Long carId) {
        List<Review> reviews = reviewRepository.findByCarId(carId);
        return reviews.stream().map(r -> ReviewResponseDTO.builder()
                .id(r.getId())
                .rating(r.getRating())
                .comment(r.getComment())
                .carId(r.getCar().getId())
                .carModel(r.getCar().getModel())
                .username(r.getUser().getName())
                .createdAt(r.getCreatedAt())
                .build()
        ).collect(Collectors.toList());
    }
}
