package com.carrental.sdp.carrental.repository;

import com.carrental.sdp.carrental.model.Review;
import com.carrental.sdp.carrental.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByCarId(Long carId);

    void deleteByUser(User user);
}
