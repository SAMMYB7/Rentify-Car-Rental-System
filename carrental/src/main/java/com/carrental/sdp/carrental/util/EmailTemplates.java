package com.carrental.sdp.carrental.util;

import org.springframework.web.util.HtmlUtils;

import java.time.Year;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * HTML email templates sharing one branded layout.
 *
 * Email clients (Gmail, Outlook) strip &lt;style&gt; blocks and ignore modern CSS, so everything
 * uses table-based layout with inline styles only. Buttons are "bulletproof" table buttons that
 * render as clickable buttons everywhere. Every value inserted into HTML is escaped.
 */
public final class EmailTemplates {

    private static final String DARK = "#111827";
    private static final String TEXT = "#374151";
    private static final String MUTED = "#6b7280";

    private EmailTemplates() {
    }

    // ------------------------------------------------------------------ password reset

    public static String passwordResetHtml(String name, String resetLink, int validHours) {
        String hours = hours(validHours);
        String rows = heading("Reset your password")
                + paragraph("Hi " + esc(nameOrThere(name)) + ",")
                + paragraph("We received a request to reset the password for your Rentify account. "
                        + "Click the button below to choose a new one.")
                + button("Reset Password", resetLink)
                + notice("This link expires in <strong>" + esc(hours) + "</strong> and can only be used once.")
                + fallbackLink(resetLink)
                + divider("Didn't request this? You can safely ignore this email. Your password won't change "
                        + "unless you click the button above and set a new one.");
        return layout("Reset your Rentify password",
                "Reset your Rentify password. This link expires in " + hours + ".", rows);
    }

    /** Plain-text version for clients that do not render HTML (and for spam filters). */
    public static String passwordResetText(String name, String resetLink, int validHours) {
        return """
            Hi %s,

            We received a request to reset the password for your Rentify account.
            Open the link below to choose a new password (valid for %s, single use):

            %s

            Didn't request this? You can safely ignore this email.

            - The Rentify Team
            """.formatted(nameOrThere(name), hours(validHours), resetLink);
    }

    // ------------------------------------------------------------------ booking confirmation

    /** Details shown in the booking confirmation email. */
    public record BookingDetails(
            String customerName,
            String invoiceNumber,
            String bookingId,
            String car,
            String fromDate,
            String toDate,
            long days,
            String amountPaid,
            String paymentId) {
    }

    public static String bookingConfirmationHtml(BookingDetails d, String dashboardLink) {
        Map<String, String> rows = new LinkedHashMap<>();
        rows.put("Invoice No", d.invoiceNumber());
        rows.put("Car", d.car());
        rows.put("Pick-up", d.fromDate());
        rows.put("Return", d.toDate());
        rows.put("Duration", d.days() + (d.days() == 1 ? " day" : " days"));
        rows.put("Payment ID", d.paymentId());
        rows.put("Booking ID", d.bookingId());

        String body = heading("Booking confirmed &#10003;")
                + paragraph("Hi " + esc(nameOrThere(d.customerName())) + ",")
                + paragraph("Thank you for your payment. Your booking is <strong>confirmed</strong> and your car "
                        + "will be ready for you. Your invoice is attached to this email as a PDF.")
                + detailsTable(rows, "Amount Paid", d.amountPaid())
                + button("View My Bookings", dashboardLink)
                + divider("Please carry a valid driving licence at pick-up. If you have any questions about this "
                        + "booking, just contact us and quote your invoice number.");
        return layout("Your Rentify booking is confirmed",
                "Booking confirmed: " + d.car() + ", " + d.fromDate() + " to " + d.toDate() + ".", body);
    }

    public static String bookingConfirmationText(BookingDetails d, String dashboardLink) {
        return """
            Hi %s,

            Thank you for your payment. Your booking is confirmed.

            Invoice No : %s
            Car        : %s
            Pick-up    : %s
            Return     : %s
            Duration   : %d day(s)
            Amount Paid: %s
            Payment ID : %s
            Booking ID : %s

            Your invoice is attached to this email as a PDF.
            View your bookings: %s

            - The Rentify Team
            """.formatted(nameOrThere(d.customerName()), d.invoiceNumber(), d.car(), d.fromDate(), d.toDate(),
                d.days(), d.amountPaid(), d.paymentId(), d.bookingId(), dashboardLink);
    }

    // ------------------------------------------------------------------ shared layout

    private static String layout(String title, String preheader, String contentRows) {
        int year = Year.now().getValue();
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>{{TITLE}}</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
              <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{{PREHEADER}}</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f4f6;">
                <tr>
                  <td align="center" style="padding:32px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                           style="max-width:560px;background-color:#ffffff;border-top:4px solid #111827;">
                      <tr>
                        <td style="background-color:#111827;padding:24px 32px;">
                          <span style="color:#ffffff;font-size:24px;font-weight:bold;letter-spacing:2px;">RENTIFY</span>
                        </td>
                      </tr>
                      {{CONTENT}}
                    </table>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
                      <tr>
                        <td align="center" style="padding:24px 16px;font-size:12px;line-height:18px;color:#9ca3af;">
                          &copy; {{YEAR}} Rentify Car Services. All rights reserved.<br>
                          This is an automated message, please do not reply.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """
                .replace("{{TITLE}}", esc(title))
                .replace("{{PREHEADER}}", esc(preheader))
                .replace("{{YEAR}}", String.valueOf(year))
                .replace("{{CONTENT}}", contentRows);
    }

    // ------------------------------------------------------------------ building blocks
    // Arguments documented as "html" are inserted as-is; callers escape user data with esc().

    private static String heading(String html) {
        return "<tr><td style=\"padding:40px 32px 8px 32px;\"><h1 style=\"margin:0 0 8px 0;font-size:22px;"
                + "line-height:30px;color:" + DARK + ";\">" + html + "</h1></td></tr>";
    }

    private static String paragraph(String html) {
        return "<tr><td style=\"padding:8px 32px;\"><p style=\"margin:0;font-size:15px;line-height:24px;color:"
                + TEXT + ";\">" + html + "</p></td></tr>";
    }

    private static String button(String label, String href) {
        return "<tr><td align=\"center\" style=\"padding:28px 32px 32px 32px;\">"
                + "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>"
                + "<td align=\"center\" bgcolor=\"" + DARK + "\" style=\"background-color:" + DARK + ";\">"
                + "<a href=\"" + esc(href) + "\" target=\"_blank\" style=\"display:inline-block;padding:14px 36px;"
                + "font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;letter-spacing:0.5px;\">"
                + esc(label) + "</a></td></tr></table></td></tr>";
    }

    private static String notice(String html) {
        return "<tr><td style=\"padding:0 32px;\"><p style=\"margin:0 0 24px 0;padding:12px 16px;"
                + "background-color:#f9fafb;border-left:3px solid " + DARK + ";font-size:13px;line-height:20px;"
                + "color:#4b5563;\">" + html + "</p></td></tr>";
    }

    private static String fallbackLink(String href) {
        String safe = esc(href);
        return "<tr><td style=\"padding:0 32px 32px 32px;\">"
                + "<p style=\"margin:0 0 8px 0;font-size:13px;line-height:20px;color:" + MUTED + ";\">"
                + "Button not working? Copy and paste this link into your browser:</p>"
                + "<p style=\"margin:0;font-size:13px;line-height:20px;word-break:break-all;\">"
                + "<a href=\"" + safe + "\" target=\"_blank\" style=\"color:" + DARK + ";text-decoration:underline;\">"
                + safe + "</a></p></td></tr>";
    }

    private static String divider(String html) {
        return "<tr><td style=\"padding:24px 32px;border-top:1px solid #e5e7eb;\">"
                + "<p style=\"margin:0;font-size:13px;line-height:20px;color:" + MUTED + ";\">" + html
                + "</p></td></tr>";
    }

    /** Two-column summary table with a highlighted total row. Values are escaped. */
    private static String detailsTable(Map<String, String> rows, String totalLabel, String totalValue) {
        StringBuilder sb = new StringBuilder();
        sb.append("<tr><td style=\"padding:20px 32px 0 32px;\">")
          .append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" ")
          .append("style=\"border:1px solid #e5e7eb;\">");
        rows.forEach((label, value) -> sb
                .append("<tr>")
                .append("<td style=\"padding:10px 14px;font-size:13px;color:").append(MUTED)
                .append(";border-bottom:1px solid #e5e7eb;width:38%;\">").append(esc(label)).append("</td>")
                .append("<td style=\"padding:10px 14px;font-size:13px;color:").append(DARK)
                .append(";border-bottom:1px solid #e5e7eb;word-break:break-all;\">").append(esc(value)).append("</td>")
                .append("</tr>"));
        sb.append("<tr>")
          .append("<td style=\"padding:12px 14px;font-size:14px;font-weight:bold;color:#ffffff;background-color:")
          .append(DARK).append(";\">").append(esc(totalLabel)).append("</td>")
          .append("<td style=\"padding:12px 14px;font-size:14px;font-weight:bold;color:#ffffff;background-color:")
          .append(DARK).append(";\">").append(esc(totalValue)).append("</td>")
          .append("</tr></table></td></tr>");
        return sb.toString();
    }

    private static String esc(String value) {
        return value == null ? "" : HtmlUtils.htmlEscape(value);
    }

    private static String nameOrThere(String name) {
        return name == null || name.isBlank() ? "there" : name;
    }

    private static String hours(int validHours) {
        return validHours + (validHours == 1 ? " hour" : " hours");
    }
}
