package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.model.Booking;
import com.carrental.sdp.carrental.model.Car;
import com.carrental.sdp.carrental.model.Payment;
import com.carrental.sdp.carrental.repository.PaymentRepository;
import com.carrental.sdp.carrental.util.EmailTemplates;
import com.carrental.sdp.carrental.util.EmailTemplates.BookingDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Sends the "booking confirmed" email with the PDF invoice attached after a successful payment.
 *
 * This runs AFTER the payment has been committed. It never throws: a mail/PDF failure is logged and
 * reported as false, so it can never undo or block a confirmed payment.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingConfirmationService {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy", Locale.ENGLISH);

    private final PaymentRepository paymentRepository;
    private final InvoiceService invoiceService;
    private final EmailService emailService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    /** @return true if the confirmation email (with invoice) was sent */
    @Transactional(readOnly = true)
    public boolean sendInvoiceEmail(String razorpayOrderId) {
        try {
            Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                    .orElseThrow(() -> new IllegalStateException("Payment not found: " + razorpayOrderId));
            Booking booking = payment.getBooking();
            Car car = booking.getCar();

            byte[] pdf = invoiceService.generatePdf(payment);
            String invoiceNumber = invoiceService.invoiceNumber(payment);

            BookingDetails details = new BookingDetails(
                    booking.getUser().getName(),
                    invoiceNumber,
                    booking.getId().toString(),
                    car.getBrand() + " " + car.getModel() + " (" + car.getType() + ")",
                    booking.getStartDate().format(DATE),
                    booking.getEndDate().format(DATE),
                    booking.rentalDays(),
                    money(payment.getAmount()),
                    payment.getRazorpayPaymentId() != null ? payment.getRazorpayPaymentId() : "-");

            String dashboardLink = frontendUrl.replaceAll("/+$", "") + "/dashboard";
            emailService.sendHtmlEmailWithAttachment(
                    booking.getUser().getEmail(),
                    "Booking confirmed - " + invoiceNumber,
                    EmailTemplates.bookingConfirmationText(details, dashboardLink),
                    EmailTemplates.bookingConfirmationHtml(details, dashboardLink),
                    invoiceService.fileName(payment),
                    pdf,
                    "application/pdf");

            log.info("Sent booking confirmation {} to {}", invoiceNumber, booking.getUser().getEmail());
            return true;
        } catch (Exception e) {
            log.error("Could not send booking confirmation for order {}", razorpayOrderId, e);
            return false;
        }
    }

    private static String money(Double amount) {
        NumberFormat nf = NumberFormat.getNumberInstance(Locale.of("en", "IN"));
        nf.setMinimumFractionDigits(2);
        nf.setMaximumFractionDigits(2);
        return "₹" + nf.format(amount == null ? 0 : amount); // the rupee sign is fine in HTML email
    }
}
