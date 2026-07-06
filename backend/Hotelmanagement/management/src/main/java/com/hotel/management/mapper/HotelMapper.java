package com.hotel.management.mapper;

import com.hotel.management.dto.request.HotelRequest;
import com.hotel.management.dto.response.HotelResponse;
import com.hotel.management.entity.Hotel;
import org.springframework.stereotype.Component;

@Component
public class HotelMapper {

    // RequestDTO → Entity (for CREATE)
    public Hotel toEntity(HotelRequest request) {
        return Hotel.builder()
                .name(request.getName())
                .location(request.getLocation())
                .description(request.getDescription())
                .build();
    }

    // Entity → ResponseDTO
    public HotelResponse toResponse(Hotel hotel) {
        return HotelResponse.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .location(hotel.getLocation())
                .description(hotel.getDescription())
                .imageUrl(hotel.getImageUrl())
                .createdAt(hotel.getCreatedAt())
                .build();
    }

    // Update existing Entity from RequestDTO (for UPDATE)
    public void updateEntity(Hotel hotel, HotelRequest request) {
        hotel.setName(request.getName());
        hotel.setLocation(request.getLocation());
        hotel.setDescription(request.getDescription());
    }
}