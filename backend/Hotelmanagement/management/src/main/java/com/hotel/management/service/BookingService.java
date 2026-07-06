package com.hotel.management.service;

import com.hotel.management.dto.request.BookingRequest;
import com.hotel.management.dto.response.BookingResponse;
import com.hotel.management.dto.response.PageResponse;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request, String userEmail);
    BookingResponse getBookingById(Long id);
    PageResponse<BookingResponse> getAllBookings(int page, int size);
    PageResponse<BookingResponse> getMyBookings(String userEmail, int page, int size);
    BookingResponse cancelBooking(Long id, String userEmail);
}