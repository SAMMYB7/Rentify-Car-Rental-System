package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.model.Booking;
import com.carrental.sdp.carrental.model.BookingStatus;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * The single source of truth for what a renter may do with a booking, and how much is refunded.
 * Used to build the UI flags (BookingResponseDto) AND to enforce the rules when cancelling, so the
 * refund shown in the confirmation dialog is exactly what is applied.
 *
 * Rules (they match the Terms & Conditions page):
 *  - Unpaid (BOOKED): can change dates or cancel any time before pickup. Nothing to refund.
 *  - Paid, 48h+ before pickup: can cancel with a FULL refund. Dates cannot change (cancel and rebook).
 *  - Paid, within 48h of pickup: can cancel; one day's rental is kept as a fee, the rest is refunded.
 *  - After the pickup day has ended, or cancelled/completed: no changes.
 *  - An admin cancelling always refunds in full (company-initiated cancellation).
 *
 * The 48h window is measured to the start of the pickup date; changes are allowed until that day ends.
 */
public final class CancellationPolicy {

    public static final long FREE_CANCELLATION_HOURS = 48;

    private CancellationPolicy() {
    }

    /** What is allowed right now, and the refund that cancelling now would give. */
    public record Quote(boolean editable, boolean cancellable, double refund, double fee, String note) {
    }

    public static Quote evaluate(Booking booking, LocalDateTime now, boolean byAdmin) {
        BookingStatus status = booking.getStatus();
        if (status == BookingStatus.CANCELLED || status == BookingStatus.COMPLETED) {
            return new Quote(false, false, 0, 0, "This booking is " + status.name().toLowerCase() + ".");
        }

        // The exact pickup time isn't stored, so the booking stays changeable for the whole pickup day
        // (a car booked for today can still be cancelled today). It locks once that day is over.
        LocalDateTime pickup = booking.getStartDate().atStartOfDay();
        LocalDateTime lockAt = booking.getStartDate().plusDays(1).atStartOfDay();
        if (!now.isBefore(lockAt)) {
            return new Quote(false, false, 0, 0, "The trip has already started, so it can no longer be changed.");
        }

        if (status == BookingStatus.BOOKED) {
            return new Quote(true, true, 0, 0, "Not paid yet, so there is nothing to refund.");
        }

        // PAID
        double total = round(booking.totalPrice());
        if (byAdmin) {
            return new Quote(false, true, total, 0, "Cancelled by Rentify: full refund.");
        }
        long hoursToPickup = Math.max(0, Duration.between(now, pickup).toHours());
        if (hoursToPickup >= FREE_CANCELLATION_HOURS) {
            return new Quote(false, true, total, 0,
                    "More than " + FREE_CANCELLATION_HOURS + " hours before pickup: full refund.");
        }
        double fee = round(Math.min(booking.getCar().getPricePerDay(), total));
        return new Quote(false, true, round(total - fee), fee,
                "Within " + FREE_CANCELLATION_HOURS + " hours of pickup: one day's rental is kept as a cancellation fee.");
    }

    private static double round(double value) {
        return Math.round(value * 100) / 100.0;
    }
}
