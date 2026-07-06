package com.hotel.management.service.impl;

import com.hotel.management.dto.request.HotelRequest;
import com.hotel.management.dto.response.HotelResponse;
import com.hotel.management.dto.response.PageResponse;
import com.hotel.management.entity.Hotel;
import com.hotel.management.exception.ResourceNotFoundException;
import com.hotel.management.mapper.HotelMapper;
import com.hotel.management.repository.HotelRepository;
import com.hotel.management.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
// @Service marks this as business logic layer
// Spring creates one instance (singleton) and manages it

@RequiredArgsConstructor
// Lombok: generates constructor for all FINAL fields
// This is Constructor Injection — the preferred way in Spring
// WHY final? Ensures dependencies can't change after construction
@Transactional
// All methods run inside a DB transaction by default
// If any exception occurs, DB changes are rolled back automatically
public class HotelServiceImpl implements HotelService {

    // Constructor Injection via @RequiredArgsConstructor
    // Spring automatically injects these beans
    private final HotelRepository hotelRepository;
    private final HotelMapper hotelMapper;

    @Override
    public HotelResponse createHotel(HotelRequest request) {
        // 1. Convert DTO → Entity
        Hotel hotel = hotelMapper.toEntity(request);
        // 2. Save to DB
        Hotel savedHotel = hotelRepository.save(hotel);
        // 3. Convert Entity → ResponseDTO and return
        return hotelMapper.toResponse(savedHotel);
    }

    @Override
    @Transactional(readOnly = true)
    // readOnly = true → performance optimization for SELECT queries
    // Hibernate skips dirty checking (no need to track changes)
    public HotelResponse getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
        // orElseThrow → if empty Optional, throw our custom exception
        return hotelMapper.toResponse(hotel);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<HotelResponse> getAllHotels(
            int page, int size, String sortBy, String sortDir) {

        // Build Sort object
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        // Build Pageable (0-indexed pages)
        Pageable pageable = PageRequest.of(page, size, sort);

        // Fetch from DB
        Page<Hotel> hotelPage = hotelRepository.findAll(pageable);

        // Convert Page<Entity> → List<ResponseDTO>
        List<HotelResponse> content = hotelPage.getContent()
                .stream()
                .map(hotelMapper::toResponse)
                .collect(Collectors.toList());

        // Build our PageResponse wrapper
        return PageResponse.<HotelResponse>builder()
                .content(content)
                .pageNumber(hotelPage.getNumber())
                .pageSize(hotelPage.getSize())
                .totalElements(hotelPage.getTotalElements())
                .totalPages(hotelPage.getTotalPages())
                .lastPage(hotelPage.isLast())
                .build();
    }

    @Override
    public HotelResponse updateHotel(Long id, HotelRequest request) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));

        // Update fields via mapper (not create new entity)
        hotelMapper.updateEntity(hotel, request);

        Hotel updatedHotel = hotelRepository.save(hotel);
        return hotelMapper.toResponse(updatedHotel);
    }

    @Override
    public void deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
        hotelRepository.delete(hotel);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<HotelResponse> searchHotels(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Hotel> hotelPage = hotelRepository.searchHotels(keyword, pageable);

        List<HotelResponse> content = hotelPage.getContent()
                .stream()
                .map(hotelMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<HotelResponse>builder()
                .content(content)
                .pageNumber(hotelPage.getNumber())
                .pageSize(hotelPage.getSize())
                .totalElements(hotelPage.getTotalElements())
                .totalPages(hotelPage.getTotalPages())
                .lastPage(hotelPage.isLast())
                .build();
    }

    @Override
    public HotelResponse uploadHotelImage(Long id, MultipartFile file) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));

        try {
            // Create uploads directory if it doesn't exist
            String uploadDir = "uploads/hotels/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename to avoid collisions
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            // Save file path in hotel entity
            hotel.setImageUrl(uploadDir + fileName);
            hotelRepository.save(hotel);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }

        return hotelMapper.toResponse(hotel);
    }
}