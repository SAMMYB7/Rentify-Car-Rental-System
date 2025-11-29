package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.dto.PaymentResponseDto;
import com.carrental.sdp.carrental.model.Booking;
import com.carrental.sdp.carrental.model.BookingStatus;
import com.carrental.sdp.carrental.model.Payment;
import com.carrental.sdp.carrental.model.PaymentStatus;
import com.carrental.sdp.carrental.model.User;
import com.carrental.sdp.carrental.repository.BookingRepository;
import com.carrental.sdp.carrental.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final RazorpayClient razorpayClient;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Value("${razorpay.key_id}")
    private String razorpayApiKey;

    @Override
    @Transactional
    public PaymentResponseDto createPaymentOrder(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Calculate total price
        long days = ChronoUnit.DAYS.between(booking.getStartDate(), booking.getEndDate()) + 1;
        double amount = booking.getCar().getPricePerDay() * days;

        // Razorpay expects amount in paise (multiply by 100)
        int amountInPaise = (int) (amount * 100);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "booking_" + bookingId);
        System.out.println("Creating Razorpay order with amount: " + amountInPaise + ", currency: INR, receipt: booking_" + bookingId);
        try {
            Order order = razorpayClient.orders.create(orderRequest);

            Payment payment = Payment.builder()
                    .booking(booking)
                    .razorpayOrderId(order.get("id"))
                    .amount(amount)
                    .status(PaymentStatus.PENDING)
                    .build();
            paymentRepository.save(payment);

            // Fix: Convert Integer to Double (divide by 100.0 to get rupees if you want)
            Integer amountInPaiseResponse = order.get("amount");
            Double amountInRupees = amountInPaiseResponse / 100.0;

            return PaymentResponseDto.builder()
                    .orderId(order.get("id"))
                    .amount(amountInRupees) // or use amountInPaiseResponse.doubleValue() if you want to keep paise
                    .currency("INR")
                    .key(razorpayApiKey) // Use the stored API key
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to create Razorpay order", e);
        }
    }

    @Override
    @Transactional
    public void updatePaymentStatus(String razorpayOrderId, String status) {
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setStatus(PaymentStatus.valueOf(status));
        payment.setPaymentTime(java.time.LocalDateTime.now());
        paymentRepository.save(payment);

        // Update booking status if payment is successful
        if (PaymentStatus.SUCCESS.name().equals(status)) {
            Booking booking = payment.getBooking();
            booking.setStatus(BookingStatus.PAID); // or BookingStatus.SUCCESS if you prefer
            bookingRepository.save(booking);
        }
    }

    @Override
    @Transactional
    public PaymentResponseDto createPaymentOrder(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("You do not own this booking.");
        }

        // Duplicate Payment Prevention
        List<Payment> existingPayments = paymentRepository.findByBookingAndStatusIn(
            booking, List.of("PENDING", "SUCCESS"));
        if (!existingPayments.isEmpty()) {
            throw new RuntimeException("A payment for this booking already exists.");
        }

        // Calculate total price
        long days = ChronoUnit.DAYS.between(booking.getStartDate(), booking.getEndDate()) + 1;
        double amount = booking.getCar().getPricePerDay() * days;

        // Razorpay expects amount in paise (multiply by 100)
        int amountInPaise = (int) (amount * 100);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "booking_" + bookingId);

        try {
            Order order = razorpayClient.orders.create(orderRequest);

            Payment payment = Payment.builder()
                    .booking(booking)
                    .razorpayOrderId(order.get("id"))
                    .amount(amount)
                    .status(PaymentStatus.PENDING)
                    .build();
            paymentRepository.save(payment);

            // Fix: Convert Integer to Double (divide by 100.0 to get rupees if you want)
            Integer amountInPaiseResponse = order.get("amount");
            Double amountInRupees = amountInPaiseResponse / 100.0;

            return PaymentResponseDto.builder()
                    .orderId(order.get("id"))
                    .amount(amountInRupees) // or use amountInPaiseResponse.doubleValue() if you want to keep paise
                    .currency("INR")
                    .key(razorpayApiKey) // Use the stored API key
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Razorpay order", e);
        }
    }

    @Override
    public PaymentResponseDto getPaymentByBooking(Long bookingId, User user) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        // Only booking owner or admin can view
        if (!booking.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Unauthorized to view this payment.");
        }
        List<Payment> payments = paymentRepository.findByBookingAndStatusIn(
                booking, List.of("PENDING", "SUCCESS", "FAILED"));
        if (payments.isEmpty()) {
            throw new RuntimeException("No payment found for this booking.");
        }
        Payment payment = payments.get(0); // If multiple, return the first (or latest if you want)
        return PaymentResponseDto.builder()
                .orderId(payment.getRazorpayOrderId())
                .amount(payment.getAmount())
                .currency("INR")
                .key(razorpayApiKey)
                .build();
    }

    @Override
    public List<PaymentResponseDto> getPaymentsForUser(Long userId) {
        List<Payment> payments = paymentRepository.findAllByUserId(userId);
        return payments.stream()
                .map(payment -> PaymentResponseDto.builder()
                        .orderId(payment.getRazorpayOrderId())
                        .amount(payment.getAmount())
                        .currency("INR")
                        .key(razorpayApiKey)
                        .build())
                .toList();
    }

    @Override
    public List<PaymentResponseDto> getAllPayments() {
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream()
                .map(payment -> PaymentResponseDto.builder()
                        .orderId(payment.getRazorpayOrderId())
                        .amount(payment.getAmount())
                        .currency("INR")
                        .key(razorpayApiKey)
                        .status(payment.getStatus() != null ? payment.getStatus().name() : null)
                        .bookingId(payment.getBooking() != null ? payment.getBooking().getId() : null)
                        .userEmail(
                            payment.getBooking() != null && payment.getBooking().getUser() != null
                            ? payment.getBooking().getUser().getEmail()
                            : null
                        )
                        .paymentTime(payment.getPaymentTime())
                        .build())
                .toList();
    }
}
