package com.hotel.management.entity;

import com.hotel.management.enums.RoomType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // MANY-TO-ONE: Room → Hotel
    // Many rooms belong to one hotel
    // This side OWNS the relationship → has the FK column
    // =====================================================
    @ManyToOne(fetch = FetchType.LAZY)
    // LAZY = don't load Hotel data until room.getHotel() is called
    // Correct choice here — you don't always need hotel data with room
    @JoinColumn(name = "hotel_id", nullable = false)
    // JoinColumn → creates "hotel_id" FK column in rooms table
    private Hotel hotel;

    @Column(name = "room_number", nullable = false, length = 10)
    private String roomNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private RoomType type;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    // precision = total digits, scale = decimal places
    // e.g., precision=10, scale=2 → max value: 99999999.99
    private BigDecimal price;
    // Always use BigDecimal for money — NEVER double or float (rounding errors!)

    @Column(name = "available")
    private Boolean available = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // =====================================================
    // ONE-TO-MANY: Room → Booking
    // =====================================================
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    private List<Booking> bookings = new ArrayList<>();
}