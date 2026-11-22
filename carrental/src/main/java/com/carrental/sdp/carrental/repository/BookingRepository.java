package com.carrental.sdp.carrental.repository;

import java.util.UUID;

import com.carrental.sdp.carrental.model.Booking;
import com.carrental.sdp.carrental.model.BookingStatus;
import com.carrental.sdp.carrental.model.Car;
import com.carrental.sdp.carrental.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

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
        UUID excludedBookingId,
        LocalDate endDate,
        LocalDate startDate
    );

    boolean existsByUser(User user);

    /** Unpaid bookings whose payment deadline has passed (released by the maintenance job). */
    List<Booking> findByStatusAndPaymentDueAtBefore(BookingStatus status, LocalDateTime moment);

    /** Paid bookings whose trip has ended (marked COMPLETED by the maintenance job). */
    List<Booking> findByStatusAndEndDateBefore(BookingStatus status, LocalDate date);
}
