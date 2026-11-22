package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.model.Booking;
import com.carrental.sdp.carrental.model.BookingStatus;
import com.carrental.sdp.carrental.model.Payment;
import com.carrental.sdp.carrental.model.PaymentStatus;
import com.carrental.sdp.carrental.repository.BookingRepository;
import com.carrental.sdp.carrental.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;

/**
 * Background housekeeping for bookings, run every minute:
 *  1. Releases unpaid bookings whose 30-minute payment window has passed, so the car is free again.
 *     A booking whose user opened Razorpay checkout recently gets a short grace period, so a payment
 *     that is in progress is not cut off.
 *  2. Marks paid bookings as COMPLETED once their trip has ended.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BookingMaintenanceJob {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    /** Extra time for a user who is in the middle of Razorpay checkout when the hold runs out. */
    @Value("${app.booking.checkout-grace-minutes:10}")
    private long checkoutGraceMinutes;

    @Scheduled(fixedDelayString = "${app.booking.maintenance-interval-ms:60000}", initialDelay = 30_000)
    @Transactional
    public void run() {
        releaseExpiredUnpaidBookings();
        completeFinishedTrips();
    }

    void releaseExpiredUnpaidBookings() {
        LocalDateTime now = LocalDateTime.now();
        int released = 0;
        for (Booking booking : bookingRepository.findByStatusAndPaymentDueAtBefore(BookingStatus.BOOKED, now)) {
            List<Payment> pending = paymentRepository.findByBookingAndStatusIn(booking, EnumSet.of(PaymentStatus.PENDING));
            boolean recentCheckout = pending.stream()
                    .anyMatch(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(now.minusMinutes(checkoutGraceMinutes)));
            boolean withinGrace = booking.getPaymentDueAt().isAfter(now.minusMinutes(checkoutGraceMinutes));
            if (recentCheckout && withinGrace) {
                continue; // the user is paying right now; check again on the next run
            }
            pending.forEach(p -> p.setStatus(PaymentStatus.FAILED));
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setCancelledAt(now);
            released++;
        }
        if (released > 0) {
            log.info("Released {} unpaid booking(s) whose payment window expired.", released);
        }
    }

    void completeFinishedTrips() {
        List<Booking> finished = bookingRepository.findByStatusAndEndDateBefore(BookingStatus.PAID, LocalDate.now());
        finished.forEach(b -> b.setStatus(BookingStatus.COMPLETED));
        if (!finished.isEmpty()) {
            log.info("Marked {} finished trip(s) as completed.", finished.size());
        }
    }
}
