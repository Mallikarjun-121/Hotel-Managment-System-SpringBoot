package com.hotel.management.service;

import com.hotel.management.dto.request.RoomRequest;
import com.hotel.management.dto.response.PageResponse;
import com.hotel.management.dto.response.RoomResponse;

import java.time.LocalDate;
import java.util.List;

public interface RoomService {
    RoomResponse createRoom(RoomRequest request);
    RoomResponse getRoomById(Long id);
    PageResponse<RoomResponse> getAllRooms(int page, int size);
    RoomResponse updateRoom(Long id, RoomRequest request);
    void deleteRoom(Long id);
    List<RoomResponse> getAvailableRooms(Long hotelId, LocalDate checkIn, LocalDate checkOut);
    PageResponse<RoomResponse> getRoomsByHotelId(Long hotelId, int page, int size);
}