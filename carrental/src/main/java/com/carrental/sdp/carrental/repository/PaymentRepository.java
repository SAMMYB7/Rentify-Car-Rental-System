package com.carrental.sdp.carrental.repository;

import com.carrental.sdp.carrental.model.Payment;
import com.carrental.sdp.carrental.model.Booking;
import com.carrental.sdp.carrental.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    List<Payment> findByBookingAndStatusIn(Booking booking, List<String> statuses);

    @Query("SELECT p FROM Payment p WHERE p.booking.user.id = :userId")
    List<Payment> findAllByUserId(@Param("userId") Long userId);
}
