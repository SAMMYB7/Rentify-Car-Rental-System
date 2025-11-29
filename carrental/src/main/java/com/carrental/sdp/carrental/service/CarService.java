package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.dto.CarRequestDTO;
import com.carrental.sdp.carrental.dto.CarResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface CarService {
    CarResponseDTO createCar(CarRequestDTO carRequest, MultipartFile image);
    List<CarResponseDTO> getAllCars();
    CarResponseDTO updateCar(Long id, CarRequestDTO carRequest, Optional<MultipartFile> image);
    void deleteCar(Long id);
    List<CarResponseDTO> searchCars(
        Optional<String> model,
        Optional<String> brand,
        Optional<String> type,
        Optional<Boolean> available,
        Optional<Double> minPrice,
        Optional<Double> maxPrice
    );
    CarResponseDTO getCarById(Long id);
}
