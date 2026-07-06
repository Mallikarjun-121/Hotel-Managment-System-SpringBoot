package com.hotel.management.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

// Generic wrapper for all paginated responses
// T = the type of data (HotelResponse, RoomResponse, etc.)
@Getter
@Setter
@Builder
public class PageResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean lastPage;
}