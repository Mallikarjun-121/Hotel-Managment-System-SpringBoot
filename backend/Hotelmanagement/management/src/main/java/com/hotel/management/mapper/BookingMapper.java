package com.hotel.management.mapper;

import com.hotel.management.dto.response.BookingResponse;
import com.hotel.management.entity.Booking;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getName())
                .roomId(booking.getRoom().getId())
                .roomNumber(booking.getRoom().getRoomNumber())
                .hotelName(booking.getRoom().getHotel().getName())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .roomType(booking.getRoom().getType().name())
                .advancePaid(booking.getAdvancePaid())
                .remainingAmount(booking.getRemainingAmount())
                .payLater(booking.getPayLater())
                .build();
    }
}