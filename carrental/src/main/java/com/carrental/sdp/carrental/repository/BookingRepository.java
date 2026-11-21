package com.carrental.sdp.carrental.repository;

import com.carrental.sdp.carrental.model.Booking;
import com.carrental.sdp.carrental.model.BookingStatus;
import com.carrental.sdp.carrental.model.Car;
import com.carrental.sdp.carrental.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    /** True if any non-cancelled booking of this car overlaps [startDate, endDate]. */
    boolean existsByCarAndStatusNotAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
        Car car,
        BookingStatus status,
        LocalDate endDate,
        LocalDate startDate
    );

    /** Same overlap check, ignoring one booking (the one being modified). */
    boolean existsByCarAndStatusNotAndIdNotAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
        Car car,
        BookingStatus status,
        Long excludedBookingId,
        LocalDate endDate,
        LocalDate startDate
    );

    boolean existsByUser(User user);
}
