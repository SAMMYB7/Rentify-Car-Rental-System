package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.model.Booking;
import com.carrental.sdp.carrental.model.Car;
import com.carrental.sdp.carrental.model.Payment;
import com.carrental.sdp.carrental.model.PaymentStatus;
import com.carrental.sdp.carrental.model.Role;
import com.carrental.sdp.carrental.model.User;
import com.carrental.sdp.carrental.repository.BookingRepository;
import com.carrental.sdp.carrental.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.openpdf.text.Chunk;
import org.openpdf.text.Document;
import org.openpdf.text.DocumentException;
import org.openpdf.text.Element;
import org.openpdf.text.Font;
import org.openpdf.text.FontFactory;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.Phrase;
import org.openpdf.text.Rectangle;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;

/**
 * Builds the PDF invoice for a successful payment.
 *
 * Note: the built-in PDF fonts have no rupee glyph, so amounts are written as "INR 1,200.00".
 */
@Service
@RequiredArgsConstructor
public class InvoiceService {

    private static final Color DARK = new Color(17, 24, 39);       // matches the site's gray-900
    private static final Color MUTED = new Color(107, 114, 128);   // gray-500
    private static final Color LIGHT_BG = new Color(243, 244, 246); // gray-100
    private static final Color BORDER = new Color(229, 231, 235);  // gray-200
    private static final Color PAID_GREEN = new Color(22, 163, 74);

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter DATE_TIME =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a", Locale.ENGLISH);

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    /** e.g. INV-20261121-3F2A9C1E (date of payment + first 8 chars of the payment id). */
    public String invoiceNumber(Payment payment) {
        LocalDateTime when = payment.getPaymentTime() != null ? payment.getPaymentTime() : payment.getCreatedAt();
        String datePart = when.toLocalDate().format(DateTimeFormatter.BASIC_ISO_DATE);
        String idPart = payment.getId().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        return "INV-" + datePart + "-" + idPart;
    }

    public String fileName(Payment payment) {
        return "Rentify-" + invoiceNumber(payment) + ".pdf";
    }

    /** Invoice for a booking's successful payment; only the booking owner or an admin may download it. */
    @Transactional(readOnly = true)
    public InvoiceFile getInvoiceForBooking(UUID bookingId, User requester) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found."));
        boolean isOwner = booking.getUser().getId().equals(requester.getId());
        if (!isOwner && requester.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot view this invoice.");
        }
        Payment payment = paymentRepository.findByBookingOrderByCreatedAtDesc(booking).stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No invoice yet: this booking has not been paid."));
        return new InvoiceFile(fileName(payment), generatePdf(payment));
    }

    public byte[] generatePdf(Payment payment) {
        Booking booking = payment.getBooking();
        User customer = booking.getUser();
        Car car = booking.getCar();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 48, 48, 48, 48);
        try {
            PdfWriter.getInstance(document, out);
            document.addTitle("Rentify Invoice " + invoiceNumber(payment));
            document.addAuthor("Rentify");
            document.open();

            document.add(header(payment));
            document.add(spacer(18));
            document.add(partiesTable(payment, customer));
            document.add(spacer(18));
            document.add(itemsTable(booking, car, payment));
            document.add(totalsTable(payment));
            document.add(spacer(28));
            document.add(footer());

            document.close();
        } catch (DocumentException e) {
            throw new IllegalStateException("Could not generate invoice PDF", e);
        }
        return out.toByteArray();
    }

    // ----------------------------------------------------------------- sections

    private PdfPTable header(Payment payment) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.2f, 1f});

        PdfPCell brand = cell(Rectangle.NO_BORDER);
        brand.setBackgroundColor(DARK);
        brand.setPadding(16);
        brand.addElement(new Paragraph("RENTIFY", font(FontFactory.HELVETICA_BOLD, 22, Color.WHITE)));
        brand.addElement(new Paragraph("Car Rental Services", font(FontFactory.HELVETICA, 10, new Color(209, 213, 219))));
        table.addCell(brand);

        PdfPCell meta = cell(Rectangle.NO_BORDER);
        meta.setBackgroundColor(DARK);
        meta.setPadding(16);
        Paragraph title = new Paragraph("INVOICE", font(FontFactory.HELVETICA_BOLD, 20, Color.WHITE));
        title.setAlignment(Element.ALIGN_RIGHT);
        meta.addElement(title);
        meta.addElement(rightLine("Invoice No: " + invoiceNumber(payment), Color.WHITE));
        meta.addElement(rightLine("Date: " + formatDateTime(payment.getPaymentTime()), Color.WHITE));
        Paragraph status = new Paragraph("PAID", font(FontFactory.HELVETICA_BOLD, 11, PAID_GREEN));
        status.setAlignment(Element.ALIGN_RIGHT);
        meta.addElement(status);
        table.addCell(meta);
        return table;
    }

    private PdfPTable partiesTable(Payment payment, User customer) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1f, 1f});

        PdfPCell billedTo = cell(Rectangle.NO_BORDER);
        billedTo.addElement(label("BILLED TO"));
        billedTo.addElement(new Paragraph(customer.getName(), font(FontFactory.HELVETICA_BOLD, 11, DARK)));
        billedTo.addElement(new Paragraph(customer.getEmail(), font(FontFactory.HELVETICA, 10, MUTED)));
        table.addCell(billedTo);

        PdfPCell paymentInfo = cell(Rectangle.NO_BORDER);
        paymentInfo.addElement(label("PAYMENT DETAILS"));
        paymentInfo.addElement(keyValue("Method", "Razorpay"));
        paymentInfo.addElement(keyValue("Order ID", payment.getRazorpayOrderId()));
        paymentInfo.addElement(keyValue("Payment ID",
                payment.getRazorpayPaymentId() != null ? payment.getRazorpayPaymentId() : "-"));
        paymentInfo.addElement(keyValue("Booking ID", payment.getBooking().getId().toString()));
        table.addCell(paymentInfo);
        return table;
    }

    private PdfPTable itemsTable(Booking booking, Car car, Payment payment) throws DocumentException {
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2.6f, 2.4f, 0.8f, 1.4f, 1.6f});

        String[] headings = {"Description", "Rental Period", "Days", "Rate / Day", "Amount"};
        for (int i = 0; i < headings.length; i++) {
            PdfPCell h = new PdfPCell(new Phrase(headings[i], font(FontFactory.HELVETICA_BOLD, 10, DARK)));
            h.setBackgroundColor(LIGHT_BG);
            h.setBorderColor(BORDER);
            h.setPadding(8);
            h.setHorizontalAlignment(i >= 2 ? Element.ALIGN_RIGHT : Element.ALIGN_LEFT);
            table.addCell(h);
        }

        String description = car.getBrand() + " " + car.getModel() + "\n" + car.getType();
        String period = formatDate(booking.getStartDate()) + "\nto " + formatDate(booking.getEndDate());
        addItemCell(table, description, Element.ALIGN_LEFT);
        addItemCell(table, period, Element.ALIGN_LEFT);
        addItemCell(table, String.valueOf(booking.rentalDays()), Element.ALIGN_RIGHT);
        addItemCell(table, money(car.getPricePerDay()), Element.ALIGN_RIGHT);
        addItemCell(table, money(payment.getAmount()), Element.ALIGN_RIGHT);
        return table;
    }

    private PdfPTable totalsTable(Payment payment) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(45);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.setWidths(new float[]{1f, 1.2f});
        table.setSpacingBefore(10);

        PdfPCell label = new PdfPCell(new Phrase("Total Paid", font(FontFactory.HELVETICA_BOLD, 12, Color.WHITE)));
        label.setBackgroundColor(DARK);
        label.setBorder(Rectangle.NO_BORDER);
        label.setPadding(10);
        table.addCell(label);

        PdfPCell value = new PdfPCell(new Phrase(money(payment.getAmount()), font(FontFactory.HELVETICA_BOLD, 12, Color.WHITE)));
        value.setBackgroundColor(DARK);
        value.setBorder(Rectangle.NO_BORDER);
        value.setPadding(10);
        value.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(value);
        return table;
    }

    private Paragraph footer() {
        Paragraph p = new Paragraph();
        p.setAlignment(Element.ALIGN_CENTER);
        p.add(new Chunk("Thank you for choosing Rentify!\n", font(FontFactory.HELVETICA_BOLD, 11, DARK)));
        p.add(new Chunk("This is a computer-generated invoice and does not require a signature.\n"
                + "For any questions, contact shyamsundarbezawada5@gmail.com",
                font(FontFactory.HELVETICA, 9, MUTED)));
        return p;
    }

    // ----------------------------------------------------------------- helpers

    private static void addItemCell(PdfPTable table, String text, int align) {
        PdfPCell c = new PdfPCell(new Phrase(text, font(FontFactory.HELVETICA, 10, DARK)));
        c.setBorderColor(BORDER);
        c.setPadding(8);
        c.setHorizontalAlignment(align);
        table.addCell(c);
    }

    private static PdfPCell cell(int border) {
        PdfPCell c = new PdfPCell();
        c.setBorder(border);
        return c;
    }

    private static Paragraph label(String text) {
        Paragraph p = new Paragraph(text, font(FontFactory.HELVETICA_BOLD, 9, MUTED));
        p.setSpacingAfter(4);
        return p;
    }

    private static Paragraph keyValue(String key, String value) {
        Paragraph p = new Paragraph();
        p.add(new Chunk(key + ": ", font(FontFactory.HELVETICA_BOLD, 9, DARK)));
        p.add(new Chunk(value, font(FontFactory.HELVETICA, 9, DARK)));
        return p;
    }

    private static Paragraph rightLine(String text, Color color) {
        Paragraph p = new Paragraph(text, font(FontFactory.HELVETICA, 9, color));
        p.setAlignment(Element.ALIGN_RIGHT);
        return p;
    }

    private static Paragraph spacer(float height) {
        Paragraph p = new Paragraph(" ");
        p.setSpacingAfter(height - 12);
        return p;
    }

    private static Font font(String name, float size, Color color) {
        return FontFactory.getFont(name, size, Font.NORMAL, color);
    }

    private static String money(Double amount) {
        NumberFormat nf = NumberFormat.getNumberInstance(Locale.of("en", "IN"));
        nf.setMinimumFractionDigits(2);
        nf.setMaximumFractionDigits(2);
        return "INR " + nf.format(amount == null ? 0 : amount);
    }

    private static String formatDate(LocalDate date) {
        return date == null ? "-" : date.format(DATE);
    }

    private static String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? "-" : dateTime.format(DATE_TIME);
    }

    /** A generated invoice: file name plus PDF bytes. */
    public record InvoiceFile(String fileName, byte[] content) {
    }
}
