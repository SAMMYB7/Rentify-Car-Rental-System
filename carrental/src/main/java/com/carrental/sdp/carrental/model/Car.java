package com.carrental.sdp.carrental.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "cars")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.CHAR) // stored as readable CHAR(36) text
    @Column(length = 36, updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private Double pricePerDay;

    @Column(nullable = false)
    private boolean available;

    @Column(length = 1000)
    private String description;

    @Column(name = "image_url")
    private String imageUrl;
}
