package com.hotel.management.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class HotelResponse {
    private Long id;
    private String name;
    private String location;
    private String description;
    private String imageUrl;
    private LocalDateTime createdAt;
}