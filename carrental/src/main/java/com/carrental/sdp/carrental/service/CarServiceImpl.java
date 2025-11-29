package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.dto.CarRequestDTO;
import com.carrental.sdp.carrental.dto.CarResponseDTO;
import com.carrental.sdp.carrental.model.Car;
import com.carrental.sdp.carrental.repository.CarRepository;
import com.carrental.sdp.carrental.util.CloudinaryUtil;
import com.carrental.sdp.carrental.repository.CarSpecifications;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.persistence.EntityNotFoundException;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CarServiceImpl implements CarService {

    @Autowired
    private CarRepository carRepository;


    @Autowired
    private CloudinaryUtil cloudinaryUtil;

    private String getImageUrl(String filename) {
        if (filename == null || filename.isEmpty()) return null;
        return "/uploads/cars/" + filename;
    }

    private CarResponseDTO toDTO(Car car) {
        CarResponseDTO dto = new CarResponseDTO();
        dto.setId(car.getId());
        dto.setModel(car.getModel());
        dto.setBrand(car.getBrand());
        dto.setType(car.getType());
        dto.setPricePerDay(car.getPricePerDay());
        dto.setAvailable(car.isAvailable());
        dto.setDescription(car.getDescription());
        dto.setImageUrl(car.getImageUrl()); // Now this is a full Cloudinary URL
        return dto;
    }

    @Override
    public CarResponseDTO createCar(CarRequestDTO carRequest, MultipartFile image) {
        Car car = new Car();
        car.setModel(carRequest.getModel());
        car.setBrand(carRequest.getBrand());
        car.setType(carRequest.getType());
        car.setPricePerDay(carRequest.getPricePerDay());
        car.setAvailable(carRequest.isAvailable());
        car.setDescription(carRequest.getDescription());

        if (image != null && !image.isEmpty()) {
            try {
                String imageUrl = cloudinaryUtil.uploadImage(image);
                car.setImageUrl(imageUrl);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload image", e);
            }
        }

        Car savedCar = carRepository.save(car);
        return toDTO(savedCar);
    }

    @Override
    public List<CarResponseDTO> getAllCars() {
        return carRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CarResponseDTO updateCar(Long id, CarRequestDTO carRequest, Optional<MultipartFile> image) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        car.setModel(carRequest.getModel());
        car.setBrand(carRequest.getBrand());
        car.setType(carRequest.getType());
        car.setPricePerDay(carRequest.getPricePerDay());
        car.setAvailable(carRequest.isAvailable());
        car.setDescription(carRequest.getDescription());

        if (image.isPresent() && image.get() != null && !image.get().isEmpty()) {
            // Delete old image from Cloudinary if exists
            if (car.getImageUrl() != null) {
                try {
                    cloudinaryUtil.deleteImageByUrl(car.getImageUrl());
                } catch (IOException ignored) {}
            }
            try {
                String imageUrl = cloudinaryUtil.uploadImage(image.get());
                car.setImageUrl(imageUrl);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload image", e);
            }
        }

        Car updatedCar = carRepository.save(car);
        return toDTO(updatedCar);
    }

    @Override
    public void deleteCar(Long id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found"));
        // Delete image from Cloudinary if exists
        if (car.getImageUrl() != null) {
            try {
                cloudinaryUtil.deleteImageByUrl(car.getImageUrl());
            } catch (IOException ignored) {}
        }
        carRepository.deleteById(id);
    }

    @Override
    public List<CarResponseDTO> searchCars(
            Optional<String> model,
            Optional<String> brand,
            Optional<String> type,
            Optional<Boolean> available,
            Optional<Double> minPrice,
            Optional<Double> maxPrice
    ) {
        Specification<Car> spec = Specification.where(null);

        if (model.isPresent()) {
            spec = spec.and(CarSpecifications.hasModel(model.get()));
        }
        if (brand.isPresent()) {
            spec = spec.and(CarSpecifications.hasBrand(brand.get()));
        }
        if (type.isPresent()) {
            spec = spec.and(CarSpecifications.hasType(type.get()));
        }
        if (available.isPresent()) {
            spec = spec.and(CarSpecifications.isAvailable(available.get()));
        }
        if (minPrice.isPresent()) {
            spec = spec.and(CarSpecifications.hasMinPrice(minPrice.get()));
        }
        if (maxPrice.isPresent()) {
            spec = spec.and(CarSpecifications.hasMaxPrice(maxPrice.get()));
        }

        return carRepository.findAll(spec)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CarResponseDTO getCarById(Long id) {
        Car car = carRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Car not found"));
        return toDTO(car);
    }
}
