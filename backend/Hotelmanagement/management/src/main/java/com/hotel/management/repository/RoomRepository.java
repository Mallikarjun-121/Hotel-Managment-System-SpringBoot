package com.hotel.management.repository;

import com.hotel.management.entity.Room;
import com.hotel.management.enums.RoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    // ✅ FIXED → Add Pageable ✅
    Page<Room> findByHotelId(Long hotelId, Pageable pageable);

    // ✅ optional (keep if needed)
    List<Room> findByHotelIdAndAvailable(Long hotelId, Boolean available);

    // ✅ already correct
    Page<Room> findByAvailable(Boolean available, Pageable pageable);

    // ✅ native query (unchanged)
    @Query(value = """
            SELECT r.* FROM rooms r
            WHERE r.available = true
            AND r.hotel_id = :hotelId
            AND r.id NOT IN (
                SELECT b.room_id FROM bookings b
                WHERE b.status != 'CANCELLED'
                AND b.check_in < :checkOut
                AND b.check_out > :checkIn
            )
            """, nativeQuery = true)
    List<Room> findAvailableRoomsForDates(
            @Param("hotelId") Long hotelId,
            @Param("checkIn") String checkIn,
            @Param("checkOut") String checkOut
    );

    // ✅ optional filter
    List<Room> findByTypeAndAvailable(RoomType type, Boolean available);
}