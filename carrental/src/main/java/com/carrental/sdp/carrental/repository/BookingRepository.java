package com.carrental.sdp.carrental.repository;

import com.carrental.sdp.carrental.model.Booking;
import com.carrental.sdp.carrental.model.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    boolean existsByCarAndStatusNotAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
        Car car,
        com.carrental.sdp.carrental.model.BookingStatus status,
        LocalDate endDate,
        LocalDate startDate
    );
}
