package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.model.User;
import com.carrental.sdp.carrental.model.PasswordResetToken;
import com.carrental.sdp.carrental.repository.UserRepository;
import com.carrental.sdp.carrental.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ForgotPasswordService {
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    @Transactional
    public void processForgotPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // For security, do not reveal if user exists
            return;
        }
        User user = userOpt.get();

        // Remove any previous tokens for this user
        tokenRepository.deleteByUser(user);

        // Generate and save new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(1)) // 1 hour expiry
                .build();
        tokenRepository.save(resetToken);

        // Send email
        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        String subject = "Password Reset Request";
        String text = String.format(
                "Hi %s,\n\nClick the link below to reset your password:\n%s\n\nIf you did not request this, ignore this email.",
                user.getName(), resetLink
        );
        emailService.sendSimpleEmail(email, subject, text);
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token."));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Token has expired.");
        }

        User user = resetToken.getUser();
        user.setPassword(new BCryptPasswordEncoder().encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken); // Invalidate token after use
    }
}
