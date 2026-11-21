package com.carrental.sdp.carrental.util;

import org.springframework.web.util.HtmlUtils;

import java.time.Year;

/**
 * HTML email templates.
 *
 * Email clients (Gmail, Outlook) strip &lt;style&gt; blocks and ignore modern CSS, so these use
 * table-based layout with inline styles only. The button is a "bulletproof" table button that
 * renders as a clickable button everywhere, with a plain link underneath as a fallback.
 */
public final class EmailTemplates {

    private EmailTemplates() {
    }

    public static String passwordResetHtml(String name, String resetLink, int validHours) {
        String safeName = HtmlUtils.htmlEscape(name == null || name.isBlank() ? "there" : name);
        String safeLink = HtmlUtils.htmlEscape(resetLink);
        String hours = validHours + (validHours == 1 ? " hour" : " hours");
        int year = Year.now().getValue();

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset your Rentify password</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
              <!-- Preheader: shown in the inbox preview, hidden in the email body -->
              <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
                Reset your Rentify password. This link expires in %4$s.
              </div>

              <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f4f6;">
                <tr>
                  <td align="center" style="padding:32px 16px;">

                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0"
                           style="max-width:560px;background-color:#ffffff;border-top:4px solid #111827;">

                      <!-- Header -->
                      <tr>
                        <td style="background-color:#111827;padding:24px 32px;">
                          <span style="color:#ffffff;font-size:24px;font-weight:bold;letter-spacing:2px;">RENTIFY</span>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding:40px 32px 8px 32px;color:#111827;">
                          <h1 style="margin:0 0 16px 0;font-size:22px;line-height:30px;color:#111827;">
                            Reset your password
                          </h1>
                          <p style="margin:0 0 16px 0;font-size:15px;line-height:24px;color:#374151;">
                            Hi %1$s,
                          </p>
                          <p style="margin:0 0 28px 0;font-size:15px;line-height:24px;color:#374151;">
                            We received a request to reset the password for your Rentify account.
                            Click the button below to choose a new one.
                          </p>
                        </td>
                      </tr>

                      <!-- Button -->
                      <tr>
                        <td align="center" style="padding:0 32px 32px 32px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td align="center" bgcolor="#111827" style="background-color:#111827;">
                                <a href="%2$s" target="_blank"
                                   style="display:inline-block;padding:14px 36px;font-size:16px;font-weight:bold;
                                          color:#ffffff;text-decoration:none;letter-spacing:0.5px;">
                                  Reset Password
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Expiry notice -->
                      <tr>
                        <td style="padding:0 32px;">
                          <p style="margin:0 0 24px 0;padding:12px 16px;background-color:#f9fafb;border-left:3px solid #111827;
                                    font-size:13px;line-height:20px;color:#4b5563;">
                            This link expires in <strong>%4$s</strong> and can only be used once.
                          </p>
                        </td>
                      </tr>

                      <!-- Fallback link -->
                      <tr>
                        <td style="padding:0 32px 32px 32px;">
                          <p style="margin:0 0 8px 0;font-size:13px;line-height:20px;color:#6b7280;">
                            Button not working? Copy and paste this link into your browser:
                          </p>
                          <p style="margin:0;font-size:13px;line-height:20px;word-break:break-all;">
                            <a href="%2$s" target="_blank" style="color:#111827;text-decoration:underline;">%2$s</a>
                          </p>
                        </td>
                      </tr>

                      <!-- Security note -->
                      <tr>
                        <td style="padding:24px 32px;border-top:1px solid #e5e7eb;">
                          <p style="margin:0;font-size:13px;line-height:20px;color:#6b7280;">
                            Didn't request this? You can safely ignore this email. Your password won't change
                            unless you click the button above and set a new one.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Footer -->
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
                      <tr>
                        <td align="center" style="padding:24px 16px;font-size:12px;line-height:18px;color:#9ca3af;">
                          &copy; %3$d Rentify Car Services. All rights reserved.<br>
                          This is an automated message, please do not reply.
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(safeName, safeLink, year, hours);
    }

    /** Plain-text version for clients that do not render HTML (and for spam filters). */
    public static String passwordResetText(String name, String resetLink, int validHours) {
        String hours = validHours + (validHours == 1 ? " hour" : " hours");
        return """
            Hi %s,

            We received a request to reset the password for your Rentify account.
            Open the link below to choose a new password (valid for %s, single use):

            %s

            Didn't request this? You can safely ignore this email.

            - The Rentify Team
            """.formatted(name == null || name.isBlank() ? "there" : name, hours, resetLink);
    }
}
