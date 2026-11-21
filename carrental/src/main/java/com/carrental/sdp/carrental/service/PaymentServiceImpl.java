package com.carrental.sdp.carrental.service;

import java.util.UUID;

import com.carrental.sdp.carrental.dto.PaymentResponseDto;
import com.carrental.sdp.carrental.model.Booking;
import com.carrental.sdp.carrental.model.BookingStatus;
import com.carrental.sdp.carrental.model.Payment;
import com.carrental.sdp.carrental.model.PaymentStatus;
import com.carrental.sdp.carrental.model.Role;
import com.carrental.sdp.carrental.model.User;
import com.carrental.sdp.carrental.repository.BookingRepository;
import com.carrental.sdp.carrental.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final String CURRENCY = "INR";

    private final RazorpayClient razorpayClient;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Value("${razorpay.key_id}")
    private String razorpayApiKey;

    @Value("${razorpay.key_secret}")
    private String razorpaySecret;

    @Override
    @Transactional
    public PaymentResponseDto createPaymentOrder(UUID bookingId, UUID userId) {
        if (bookingId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "bookingId is required.");
        }
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found."));

        if (!booking.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this booking.");
        }
        if (booking.getStatus() != BookingStatus.BOOKED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This booking cannot be paid (status: " + booking.getStatus() + ").");
        }

        List<Payment> existing = paymentRepository.findByBookingAndStatusIn(
                booking, EnumSet.of(PaymentStatus.PENDING, PaymentStatus.SUCCESS));

        if (existing.stream().anyMatch(p -> p.getStatus() == PaymentStatus.SUCCESS)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This booking has already been paid.");
        }

        long amountInPaise = Math.round(booking.totalPrice() * 100);
        double amount = amountInPaise / 100.0;

        // Reuse a pending order (e.g. the user closed the checkout and retried), but only if Razorpay
        // still knows it under the CURRENT key, it is unpaid and the amount matches. Orders created
        // under an old/rotated key make checkout fail with 400, so those are retired instead.
        Optional<Payment> reusable = existing.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .filter(p -> isReusableOrder(p.getRazorpayOrderId(), amountInPaise))
                .findFirst();
        if (reusable.isPresent()) {
            return checkoutResponse(reusable.get().getRazorpayOrderId(), amount);
        }

        // Any other pending orders are stale (wrong key, wrong amount or unknown to Razorpay); retire them.
        existing.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .forEach(p -> p.setStatus(PaymentStatus.FAILED));

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", CURRENCY);
        orderRequest.put("receipt", "booking_" + bookingId);

        String orderId;
        try {
            Order order = razorpayClient.orders.create(orderRequest);
            orderId = order.get("id");
        } catch (RazorpayException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Could not create payment order. Please try again.", e);
        }

        paymentRepository.save(Payment.builder()
                .booking(booking)
                .razorpayOrderId(orderId)
                .amount(amount)
                .status(PaymentStatus.PENDING)
                .build());

        return checkoutResponse(orderId, amount);
    }

    @Override
    @Transactional
    public void verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature, User user) {
        if (isBlank(razorpayOrderId) || isBlank(razorpayPaymentId) || isBlank(razorpaySignature)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing payment verification fields.");
        }

        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found."));

        Booking booking = payment.getBooking();
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this payment.");
        }

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return; // already verified; make retries harmless
        }

        JSONObject attributes = new JSONObject();
        attributes.put("razorpay_order_id", razorpayOrderId);
        attributes.put("razorpay_payment_id", razorpayPaymentId);
        attributes.put("razorpay_signature", razorpaySignature);

        boolean valid;
        try {
            valid = Utils.verifyPaymentSignature(attributes, razorpaySecret);
        } catch (RazorpayException e) {
            valid = false;
        }
        if (!valid) {
            // Do not change the stored status: an invalid signature proves nothing about the real payment.
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment signature verification failed.");
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaymentTime(LocalDateTime.now());
        booking.setStatus(BookingStatus.PAID);
        paymentRepository.save(payment);
        bookingRepository.save(booking);
    }

    @Override
    public PaymentResponseDto getPaymentByBooking(UUID bookingId, User user) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found."));

        boolean isOwner = booking.getUser().getId().equals(user.getId());
        if (!isOwner && user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot view this payment.");
        }

        List<Payment> payments = paymentRepository.findByBookingOrderByCreatedAtDesc(booking);
        Payment payment = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .findFirst()
                .orElse(payments.isEmpty() ? null : payments.get(0));
        if (payment == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No payment found for this booking.");
        }
        return toDto(payment);
    }

    @Override
    public List<PaymentResponseDto> getPaymentsForUser(UUID userId) {
        return paymentRepository.findAllByUserId(userId).stream().map(this::toDto).toList();
    }

    @Override
    public List<PaymentResponseDto> getAllPayments() {
        return paymentRepository.findAll().stream().map(this::toDto).toList();
    }

    /** True if the order exists for the configured Razorpay key, is not paid and has the expected amount. */
    private boolean isReusableOrder(String orderId, long expectedAmountInPaise) {
        try {
            Order order = razorpayClient.orders.fetch(orderId);
            Object status = order.get("status");
            Object amount = order.get("amount");
            return !"paid".equals(String.valueOf(status))
                    && amount instanceof Number n
                    && n.longValue() == expectedAmountInPaise;
        } catch (RazorpayException e) {
            return false; // not found under this key (e.g. keys were rotated) or API error
        }
    }

    private PaymentResponseDto checkoutResponse(String orderId, double amount) {
        return PaymentResponseDto.builder()
                .orderId(orderId)
                .amount(amount)
                .currency(CURRENCY)
                .key(razorpayApiKey)
                .status(PaymentStatus.PENDING.name())
                .build();
    }

    private PaymentResponseDto toDto(Payment payment) {
        Booking booking = payment.getBooking();
        return PaymentResponseDto.builder()
                .orderId(payment.getRazorpayOrderId())
                .amount(payment.getAmount())
                .currency(CURRENCY)
                .key(razorpayApiKey)
                .status(payment.getStatus() != null ? payment.getStatus().name() : null)
                .bookingId(booking != null ? booking.getId() : null)
                .userEmail(booking != null && booking.getUser() != null ? booking.getUser().getEmail() : null)
                .paymentTime(payment.getPaymentTime())
                .build();
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
