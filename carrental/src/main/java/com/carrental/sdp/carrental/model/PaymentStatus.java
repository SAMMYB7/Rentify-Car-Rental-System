package com.carrental.sdp.carrental.model;

public enum PaymentStatus {
    PENDING,
    SUCCESS,
    FAILED,
    /** The full amount was refunded (booking cancelled 48h+ before pickup, by an admin, or expired). */
    REFUNDED,
    /** Part of the amount was refunded (cancelled within 48h of pickup: one day's rental kept). */
    PARTIALLY_REFUNDED
}
