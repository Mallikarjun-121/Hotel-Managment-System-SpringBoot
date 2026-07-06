package com.hotel.management.service;

import com.hotel.management.dto.request.HotelRequest;
import com.hotel.management.dto.response.HotelResponse;
import com.hotel.management.entity.Hotel;
import com.hotel.management.exception.ResourceNotFoundException;
import com.hotel.management.mapper.HotelMapper;
import com.hotel.management.repository.HotelRepository;
import com.hotel.management.service.impl.HotelServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
// Tells JUnit to use Mockito — enables @Mock and @InjectMocks
class HotelServiceImplTest {

    @Mock
    // Creates a FAKE HotelRepository — no real DB calls
    private HotelRepository hotelRepository;

    @Mock
    private HotelMapper hotelMapper;

    @InjectMocks
    // Creates REAL HotelServiceImpl and injects the mocks above into it
    private HotelServiceImpl hotelService;

    private Hotel hotel;
    private HotelRequest hotelRequest;
    private HotelResponse hotelResponse;

    @BeforeEach
        // Runs before EACH test — sets up fresh test data
    void setUp() {
        hotelRequest = new HotelRequest();
        hotelRequest.setName("The Grand Palace");
        hotelRequest.setLocation("Mumbai");
        hotelRequest.setDescription("Luxury hotel");

        hotel = Hotel.builder()
                .id(1L)
                .name("The Grand Palace")
                .location("Mumbai")
                .description("Luxury hotel")
                .build();

        hotelResponse = HotelResponse.builder()
                .id(1L)
                .name("The Grand Palace")
                .location("Mumbai")
                .description("Luxury hotel")
                .build();
    }

    @Test
    @DisplayName("Should create hotel successfully")
    void createHotel_Success() {
        // ARRANGE — set up mock behaviour
        when(hotelMapper.toEntity(hotelRequest)).thenReturn(hotel);
        when(hotelRepository.save(any(Hotel.class))).thenReturn(hotel);
        when(hotelMapper.toResponse(hotel)).thenReturn(hotelResponse);

        // ACT — call the real method
        HotelResponse result = hotelService.createHotel(hotelRequest);

        // ASSERT — verify the result
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("The Grand Palace");
        assertThat(result.getLocation()).isEqualTo("Mumbai");

        // Verify these were called exactly once
        verify(hotelRepository, times(1)).save(any(Hotel.class));
        verify(hotelMapper, times(1)).toResponse(hotel);
    }

    @Test
    @DisplayName("Should return hotel when found by ID")
    void getHotelById_WhenFound_ReturnsHotel() {
        // ARRANGE
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(hotelMapper.toResponse(hotel)).thenReturn(hotelResponse);

        // ACT
        HotelResponse result = hotelService.getHotelById(1L);

        // ASSERT
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(hotelRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when hotel not found")
    void getHotelById_WhenNotFound_ThrowsException() {
        // ARRANGE
        when(hotelRepository.findById(99L)).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThatThrownBy(() -> hotelService.getHotelById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Hotel");

        verify(hotelRepository).findById(99L);
        // Mapper should NEVER be called if hotel not found
        verifyNoInteractions(hotelMapper);
    }

    @Test
    @DisplayName("Should delete hotel successfully")
    void deleteHotel_WhenFound_DeletesSuccessfully() {
        // ARRANGE
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        doNothing().when(hotelRepository).delete(hotel);

        // ACT
        hotelService.deleteHotel(1L);

        // ASSERT
        verify(hotelRepository).delete(hotel);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent hotel")
    void deleteHotel_WhenNotFound_ThrowsException() {
        // ARRANGE
        when(hotelRepository.findById(99L)).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThatThrownBy(() -> hotelService.deleteHotel(99L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(hotelRepository, never()).delete(any());
    }
}