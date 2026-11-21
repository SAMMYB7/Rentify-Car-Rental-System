package com.carrental.sdp.carrental.service;

import java.util.UUID;

import com.carrental.sdp.carrental.dto.CarRequestDTO;
import com.carrental.sdp.carrental.dto.CarResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface CarService {
    CarResponseDTO createCar(CarRequestDTO carRequest, MultipartFile image);
    List<CarResponseDTO> getAllCars();
    CarResponseDTO updateCar(UUID id, CarRequestDTO carRequest, Optional<MultipartFile> image);
    void deleteCar(UUID id);
    List<CarResponseDTO> searchCars(
        Optional<String> model,
        Optional<String> brand,
        Optional<String> type,
        Optional<Boolean> available,
        Optional<Double> minPrice,
        Optional<Double> maxPrice
    );
    CarResponseDTO getCarById(UUID id);
}
