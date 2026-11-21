package com.carrental.sdp.carrental.repository;

import java.util.UUID;

import com.carrental.sdp.carrental.model.PasswordResetToken;
import com.carrental.sdp.carrental.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUser(User user);
}
