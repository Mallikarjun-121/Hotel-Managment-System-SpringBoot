package com.hotel.management.controller;

import com.hotel.management.dto.request.HotelRequest;
import com.hotel.management.dto.response.HotelResponse;
import com.hotel.management.dto.response.PageResponse;
import com.hotel.management.service.HotelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@Tag(name = "Hotel Management", description = "APIs for managing hotels")
// @Tag groups these endpoints under one section in Swagger UI
public class HotelController {

    private final HotelService hotelService;

    @Operation(
            summary = "Create a new hotel",
            description = "Creates a hotel. Requires ADMIN role."
    )
    // @Operation adds a description to this specific endpoint in Swagger
    @PostMapping
    public ResponseEntity<HotelResponse> createHotel(
            @Valid @RequestBody HotelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(hotelService.createHotel(request));
    }

    @Operation(summary = "Get hotel by ID", description = "Public endpoint")
    @GetMapping("/{id}")
    public ResponseEntity<HotelResponse> getHotelById(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    @Operation(summary = "Get all hotels (paginated)", description = "Public endpoint")
    @GetMapping
    public ResponseEntity<PageResponse<HotelResponse>> getAllHotels(
            @RequestParam(defaultValue = "0")   int page,
            @RequestParam(defaultValue = "10")  int size,
            @RequestParam(defaultValue = "id")  String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(
                hotelService.getAllHotels(page, size, sortBy, sortDir));
    }

    @Operation(summary = "Update hotel", description = "Requires ADMIN role")
    @PutMapping("/{id}")
    public ResponseEntity<HotelResponse> updateHotel(
            @PathVariable Long id,
            @Valid @RequestBody HotelRequest request) {
        return ResponseEntity.ok(hotelService.updateHotel(id, request));
    }

    @Operation(summary = "Delete hotel", description = "Requires ADMIN role")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Search hotels by keyword", description = "Public endpoint")
    @GetMapping("/search")
    public ResponseEntity<PageResponse<HotelResponse>> searchHotels(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(hotelService.searchHotels(keyword, page, size));
    }

    @Operation(summary = "Upload hotel image", description = "Requires ADMIN role")
    @PostMapping("/{id}/image")
    public ResponseEntity<HotelResponse> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(hotelService.uploadHotelImage(id, file));
    }
}