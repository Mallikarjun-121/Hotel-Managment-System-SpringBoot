package com.hotel.management.entity;

import com.hotel.management.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================
    // USER RELATION
    // ============================================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ============================================
    // ROOM RELATION
    // ============================================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    // ============================================
    // BOOKING DATES
    // ============================================
    @Column(name = "check_in", nullable = false)
    private LocalDate checkIn;

    @Column(name = "check_out", nullable = false)
    private LocalDate checkOut;

    // ============================================
    // PRICE DETAILS
    // ============================================
    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;

    // ✅ NEW: advance payment
    @Column(name = "advance_paid", precision = 10, scale = 2)
    private BigDecimal advancePaid;

    // ✅ NEW: remaining amount
    @Column(name = "remaining_amount", precision = 10, scale = 2)
    private BigDecimal remainingAmount;

    // ============================================
    // PAYMENT MODE
    // ============================================
    // ✅ true → pay later
    // ✅ false → full payment done
    @Column(name = "pay_later")
    private Boolean payLater;

    // ============================================
    // STATUS
    // ============================================
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BookingStatus status;

    // ============================================
    // CREATED TIME
    // ============================================
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}