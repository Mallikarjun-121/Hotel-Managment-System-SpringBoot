package com.hotel.management.repository;

import com.hotel.management.entity.Booking;
import com.hotel.management.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Customer: view my bookings (with pagination)
    Page<Booking> findByUserId(Long userId, Pageable pageable);

    // All bookings for a room
    List<Booking> findByRoomId(Long roomId);

    // Filter bookings by status
    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    // -------------------------------------------------------
    // OVERLAP CHECK: Does this room have a conflicting booking?
    // Used before confirming a new booking
    // -------------------------------------------------------
    @Query("""
            SELECT COUNT(b) > 0 FROM Booking b
            WHERE b.room.id = :roomId
            AND b.status != 'CANCELLED'
            AND b.checkIn < :checkOut
            AND b.checkOut > :checkIn
            """)
    boolean existsOverlappingBooking(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    // Admin: bookings by user
    List<Booking> findByUserId(Long userId);
}