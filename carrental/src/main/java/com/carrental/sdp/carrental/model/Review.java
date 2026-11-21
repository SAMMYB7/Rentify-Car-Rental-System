package com.carrental.sdp.carrental.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.CHAR) // stored as readable CHAR(36) text
    @Column(length = 36, updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(optional = false)
    private Car car;

    @ManyToOne(optional = false)
    private User user;

    @Column(nullable = false)
    private int rating; // 1-5

    @Column(nullable = false)
    private String comment;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
