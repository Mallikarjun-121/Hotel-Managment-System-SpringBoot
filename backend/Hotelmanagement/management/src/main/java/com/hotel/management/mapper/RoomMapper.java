package com.hotel.management.mapper;

import com.hotel.management.dto.request.RoomRequest;
import com.hotel.management.dto.response.RoomResponse;
import com.hotel.management.entity.Room;
import org.springframework.stereotype.Component;

@Component
public class RoomMapper {

    public RoomResponse toResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .hotelId(room.getHotel().getId())
                .hotelName(room.getHotel().getName())
                .roomNumber(room.getRoomNumber())
                .type(room.getType())
                .price(room.getPrice())
                .available(room.getAvailable())
                .createdAt(room.getCreatedAt())
                .build();
    }
}