package com.hotel.management.service;

import com.hotel.management.dto.request.HotelRequest;
import com.hotel.management.dto.response.HotelResponse;
import com.hotel.management.dto.response.PageResponse;
import org.springframework.web.multipart.MultipartFile;

public interface HotelService {
    HotelResponse createHotel(HotelRequest request);
    HotelResponse getHotelById(Long id);
    PageResponse<HotelResponse> getAllHotels(int page, int size, String sortBy, String sortDir);
    HotelResponse updateHotel(Long id, HotelRequest request);
    void deleteHotel(Long id);
    PageResponse<HotelResponse> searchHotels(String keyword, int page, int size);
    HotelResponse uploadHotelImage(Long id, MultipartFile file);
}