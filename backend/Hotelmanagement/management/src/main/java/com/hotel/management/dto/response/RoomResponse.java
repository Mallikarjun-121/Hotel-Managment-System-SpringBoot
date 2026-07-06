package com.hotel.management.dto.response;

import com.hotel.management.enums.RoomType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class RoomResponse {
    private Long id;
    private Long hotelId;
    private String hotelName;
    private String roomNumber;
    private RoomType type;
    private BigDecimal price;
    private Boolean available;
    private LocalDateTime createdAt;
}