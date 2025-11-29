package com.carrental.sdp.carrental.controller;

import com.carrental.sdp.carrental.dto.CarRequestDTO;
import com.carrental.sdp.carrental.dto.CarResponseDTO;
import com.carrental.sdp.carrental.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cars")
public class CarController {

    @Autowired
    private CarService carService;

    // Create car with image
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CarResponseDTO> createCar(
            @RequestPart("car") @Valid CarRequestDTO carRequest,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        CarResponseDTO response = carService.createCar(carRequest, image);
        return ResponseEntity.ok(response);
    }

    // Get all cars
    @GetMapping
    public ResponseEntity<List<CarResponseDTO>> getAllCars() {
        return ResponseEntity.ok(carService.getAllCars());
    }

    // Get car by id
    @GetMapping("/{id}")
    public ResponseEntity<CarResponseDTO> getCarById(@PathVariable Long id) {
        CarResponseDTO car = carService.getCarById(id);
        return ResponseEntity.ok(car);
    }

    // Update car (optionally with image)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CarResponseDTO> updateCar(
            @PathVariable Long id,
            @RequestPart("car") CarRequestDTO carRequest,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        CarResponseDTO response = carService.updateCar(id, carRequest, Optional.ofNullable(image));
        return ResponseEntity.ok(response);
    }

    // Delete car
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCar(@PathVariable Long id) {
        carService.deleteCar(id);
        return ResponseEntity.noContent().build();
    }

    // Search cars by model, brand, type, and availability
    @GetMapping("/search")
    public ResponseEntity<List<CarResponseDTO>> searchCars(
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice
    ) {
        return ResponseEntity.ok(
                carService.searchCars(
                        Optional.ofNullable(model),
                        Optional.ofNullable(brand),
                        Optional.ofNullable(type),
                        Optional.ofNullable(available),
                        Optional.ofNullable(minPrice),
                        Optional.ofNullable(maxPrice)
                )
        );
    }
}
