package com.hotel.management.service.impl;

import com.hotel.management.dto.request.RoomRequest;
import com.hotel.management.dto.response.PageResponse;
import com.hotel.management.dto.response.RoomResponse;
import com.hotel.management.entity.Hotel;
import com.hotel.management.entity.Room;
import com.hotel.management.exception.ResourceNotFoundException;
import com.hotel.management.mapper.RoomMapper;
import com.hotel.management.repository.HotelRepository;
import com.hotel.management.repository.RoomRepository;
import com.hotel.management.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;
    private final RoomMapper roomMapper;

    @Override
    public RoomResponse createRoom(RoomRequest request) {
        // Validate hotel exists first
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Hotel", "id", request.getHotelId()));

        Room room = Room.builder()
                .hotel(hotel)
                .roomNumber(request.getRoomNumber())
                .type(request.getType())
                .price(request.getPrice())
                .available(true)
                .build();

        return roomMapper.toResponse(roomRepository.save(room));
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", id));
        return roomMapper.toResponse(room);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RoomResponse> getAllRooms(int page, int size) {
        Page<Room> roomPage = roomRepository.findAll(PageRequest.of(page, size));
        List<RoomResponse> content = roomPage.getContent()
                .stream().map(roomMapper::toResponse).collect(Collectors.toList());

        return PageResponse.<RoomResponse>builder()
                .content(content)
                .pageNumber(roomPage.getNumber())
                .pageSize(roomPage.getSize())
                .totalElements(roomPage.getTotalElements())
                .totalPages(roomPage.getTotalPages())
                .lastPage(roomPage.isLast())
                .build();
    }

    @Override
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", id));

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Hotel", "id", request.getHotelId()));

        room.setHotel(hotel);
        room.setRoomNumber(request.getRoomNumber());
        room.setType(request.getType());
        room.setPrice(request.getPrice());

        return roomMapper.toResponse(roomRepository.save(room));
    }

    @Override
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", id));
        roomRepository.delete(room);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAvailableRooms(
            Long hotelId, LocalDate checkIn, LocalDate checkOut) {
        return roomRepository
                .findAvailableRoomsForDates(
                        hotelId,
                        checkIn.toString(),
                        checkOut.toString())
                .stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }


    @Override
    public PageResponse<RoomResponse> getRoomsByHotelId(Long hotelId, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<Room> roomPage = roomRepository.findByHotelId(hotelId, pageable);

        List<RoomResponse> content = roomPage.getContent()
                .stream()
                .map(roomMapper::toResponse)
                .toList();

        return PageResponse.<RoomResponse>builder()
                .content(content)
                .pageNumber(roomPage.getNumber())
                .pageSize(roomPage.getSize())
                .totalElements(roomPage.getTotalElements())
                .totalPages(roomPage.getTotalPages())
                .lastPage(roomPage.isLast())
                .build();
    }
}