package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.model.PasswordResetToken;
import com.carrental.sdp.carrental.model.User;
import com.carrental.sdp.carrental.repository.PasswordResetTokenRepository;
import com.carrental.sdp.carrental.repository.UserRepository;
import com.carrental.sdp.carrental.util.EmailTemplates;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ForgotPasswordService {

    private static final int TOKEN_VALID_HOURS = 1;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    /** Base URL of the React app; the reset link in the email points here. */
    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional
    public void processForgotPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email.trim());
        if (userOpt.isEmpty()) {
            // For security, do not reveal whether the account exists.
            return;
        }
        User user = userOpt.get();

        // Only the newest link should work.
        tokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        tokenRepository.save(PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(TOKEN_VALID_HOURS))
                .build());

        String resetLink = frontendUrl.replaceAll("/+$", "") + "/reset-password?token=" + token;

        try {
            emailService.sendHtmlEmail(
                    user.getEmail(),
                    "Reset your Rentify password",
                    EmailTemplates.passwordResetText(user.getName(), resetLink, TOKEN_VALID_HOURS),
                    EmailTemplates.passwordResetHtml(user.getName(), resetLink, TOKEN_VALID_HOURS));
        } catch (MailException e) {
            // Rolls back the saved token too, so a link that was never delivered is not left behind.
            log.error("Failed to send password reset email to {}", user.getEmail(), e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "We could not send the reset email right now. Please try again later.");
        }
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "This reset link is invalid or has already been used."));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This reset link has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken); // single use
    }
}
