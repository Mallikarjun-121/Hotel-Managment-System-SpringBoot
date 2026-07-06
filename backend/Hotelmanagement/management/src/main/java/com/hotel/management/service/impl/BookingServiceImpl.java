package com.hotel.management.service.impl;

import com.hotel.management.dto.request.BookingRequest;
import com.hotel.management.dto.response.BookingResponse;
import com.hotel.management.dto.response.PageResponse;
import com.hotel.management.entity.Booking;
import com.hotel.management.entity.Room;
import com.hotel.management.entity.User;
import com.hotel.management.enums.BookingStatus;
import com.hotel.management.exception.BadRequestException;
import com.hotel.management.exception.ResourceNotFoundException;
import com.hotel.management.mapper.BookingMapper;
import com.hotel.management.repository.BookingRepository;
import com.hotel.management.repository.RoomRepository;
import com.hotel.management.repository.UserRepository;
import com.hotel.management.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;

    @Override
    public BookingResponse createBooking(BookingRequest request, String userEmail) {

        // 1. Validate dates
        if (request.getCheckIn() == null || request.getCheckOut() == null) {
            throw new BadRequestException("Check-in and Check-out are required");
        }

        if (!request.getCheckOut().isAfter(request.getCheckIn())) {
            throw new BadRequestException("Check-out must be after check-in date");
        }

        // 2. Find user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User", "email", userEmail));

        // 3. Find room
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Room", "id", request.getRoomId()));

        // 4. Check overlapping bookings
        boolean hasOverlap = bookingRepository.existsOverlappingBooking(
                room.getId(),
                request.getCheckIn(),
                request.getCheckOut()
        );

        if (hasOverlap) {
            throw new BadRequestException("Room not available for selected dates");
        }

        // 5. Calculate total price
        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());

        if (nights <= 0) {
            throw new BadRequestException("Invalid booking duration");
        }

        BigDecimal totalPrice = room.getPrice().multiply(BigDecimal.valueOf(nights));

        // ✅ 6. PAYMENT LOGIC (SAFE VERSION)
        boolean payLater = Boolean.TRUE.equals(request.getPayLater());

        BigDecimal advance = BigDecimal.ZERO;
        BigDecimal remaining = totalPrice;

        BookingStatus status;

        if (payLater) {

            advance = request.getAdvancePaid() != null
                    ? request.getAdvancePaid()
                    : BigDecimal.valueOf(1000);

            // ✅ Prevent negative values
            if (advance.compareTo(totalPrice) > 0) {
                throw new BadRequestException("Advance cannot exceed total price");
            }

            remaining = totalPrice.subtract(advance);
            status = BookingStatus.PENDING;

        } else {

            advance = BigDecimal.ZERO;
            remaining = BigDecimal.ZERO;
            status = BookingStatus.CONFIRMED;
        }

        // ✅ 7. CREATE BOOKING
        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .totalPrice(totalPrice)
                .advancePaid(advance)
                .remainingAmount(remaining)
                .payLater(payLater)
                .status(status)
                .build();

        Booking saved = bookingRepository.save(booking);

        return bookingMapper.toResponse(saved);
    }


    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        return bookingMapper.toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getAllBookings(int page, int size) {
        Page<Booking> bookingPage = bookingRepository.findAll(PageRequest.of(page, size));
        List<BookingResponse> content = bookingPage.getContent()
                .stream().map(bookingMapper::toResponse).collect(Collectors.toList());

        return PageResponse.<BookingResponse>builder()
                .content(content)
                .pageNumber(bookingPage.getNumber())
                .pageSize(bookingPage.getSize())
                .totalElements(bookingPage.getTotalElements())
                .totalPages(bookingPage.getTotalPages())
                .lastPage(bookingPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getMyBookings(String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Page<Booking> bookingPage = bookingRepository.findByUserId(
                user.getId(), PageRequest.of(page, size));

        List<BookingResponse> content = bookingPage.getContent()
                .stream().map(bookingMapper::toResponse).collect(Collectors.toList());

        return PageResponse.<BookingResponse>builder()
                .content(content)
                .pageNumber(bookingPage.getNumber())
                .pageSize(bookingPage.getSize())
                .totalElements(bookingPage.getTotalElements())
                .totalPages(bookingPage.getTotalPages())
                .lastPage(bookingPage.isLast())
                .build();
    }

    @Override
    public BookingResponse cancelBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }
}