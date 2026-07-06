package com.hotel.management.repository;

import com.hotel.management.entity.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    // -------------------------------------------------------
    // Search by location (case-insensitive partial match)
    // LOWER() → makes comparison case-insensitive
    // %:location% → LIKE wildcard search
    // -------------------------------------------------------
    @Query("SELECT h FROM Hotel h WHERE LOWER(h.location) LIKE LOWER(CONCAT('%', :location, '%'))")
    List<Hotel> findByLocationContaining(@Param("location") String location);

    // -------------------------------------------------------
    // Search by name OR location — used for Search API
    // Page<Hotel> → returns paginated results
    // Pageable    → contains page number, size, sort info
    // -------------------------------------------------------
    @Query("SELECT h FROM Hotel h WHERE " +
            "LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(h.location) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Hotel> searchHotels(@Param("keyword") String keyword, Pageable pageable);

    // Method name derivation with Pageable for pagination
    Page<Hotel> findByLocationContainingIgnoreCase(String location, Pageable pageable);
}