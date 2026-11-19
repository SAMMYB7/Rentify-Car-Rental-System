package com.carrental.sdp.carrental.util;

import com.carrental.sdp.carrental.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private static final long EXPIRATION_MILLIS = 1000L * 60 * 60 * 24; // 24 hours

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey key;

    @PostConstruct
    public void init() {
        key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .claim("name", user.getName())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + EXPIRATION_MILLIS))
                .signWith(key)
                .compact();
    }

    /**
     * Parses and verifies the token (signature and expiry).
     *
     * @throws JwtException             if the token is invalid, tampered with or expired
     * @throws IllegalArgumentException if the token is null or blank
     */
    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, User user) {
        try {
            Claims claims = parseClaims(token); // expired tokens fail here
            return user.getEmail().equals(claims.getSubject());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
