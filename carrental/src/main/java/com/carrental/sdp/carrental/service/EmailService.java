package com.carrental.sdp.carrental.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.MailPreparationException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final String SENDER_NAME = "Rentify";

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    public void sendSimpleEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    /**
     * Sends an HTML email with a plain-text alternative (multipart/alternative).
     * Clients that can render HTML show the HTML part; others show the text part.
     *
     * @throws org.springframework.mail.MailException if the message cannot be built or sent
     */
    public void sendHtmlEmail(String to, String subject, String plainText, String html) {
        sendHtmlEmailWithAttachment(to, subject, plainText, html, null, null, null);
    }

    /**
     * Same as {@link #sendHtmlEmail} plus one file attachment (skipped when attachment is null).
     *
     * @throws org.springframework.mail.MailException if the message cannot be built or sent
     */
    public void sendHtmlEmailWithAttachment(String to, String subject, String plainText, String html,
                                            String attachmentName, byte[] attachment, String contentType) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(fromAddress, SENDER_NAME); // shows as "Rentify <address>" in the inbox
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(plainText, html);
            if (attachment != null) {
                helper.addAttachment(attachmentName, new ByteArrayResource(attachment), contentType);
            }
            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            // Re-throw as a Spring MailException so callers handle every mail failure the same way.
            throw new MailPreparationException("Could not build email to " + to, e);
        }
    }
}
