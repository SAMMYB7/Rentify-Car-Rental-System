package com.carrental.sdp.carrental.repository;

import com.carrental.sdp.carrental.model.Car;
import org.springframework.data.jpa.domain.Specification;

public class CarSpecifications {
    public static Specification<Car> hasModel(String model) {
        return (root, query, cb) -> model == null ? null : cb.like(cb.lower(root.get("model")), "%" + model.toLowerCase() + "%");
    }
    public static Specification<Car> hasBrand(String brand) {
        return (root, query, cb) -> brand == null ? null : cb.like(cb.lower(root.get("brand")), "%" + brand.toLowerCase() + "%");
    }
    public static Specification<Car> hasType(String type) {
        return (root, query, cb) -> type == null ? null : cb.like(cb.lower(root.get("type")), "%" + type.toLowerCase() + "%");
    }
    public static Specification<Car> isAvailable(Boolean available) {
        return (root, query, cb) -> available == null ? null : cb.equal(root.get("available"), available);
    }
    public static Specification<Car> hasMinPrice(Double minPrice) {
        return (root, query, cb) -> minPrice == null ? null : cb.ge(root.get("pricePerDay"), minPrice);
    }
    public static Specification<Car> hasMaxPrice(Double maxPrice) {
        return (root, query, cb) -> maxPrice == null ? null : cb.le(root.get("pricePerDay"), maxPrice);
    }
}
