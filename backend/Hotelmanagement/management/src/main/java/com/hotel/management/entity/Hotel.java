package com.hotel.management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "hotels")
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "location", nullable = false, length = 200)
    private String location;

    @Column(name = "description", columnDefinition = "TEXT")
    // columnDefinition = "TEXT" → MySQL TEXT type, stores large strings
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;   // File path of uploaded hotel image

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // =====================================================
    // ONE-TO-MANY: Hotel → Room
    // One hotel has many rooms
    // mappedBy = "hotel" means Room.java owns this relationship
    //            (Room has the @ManyToOne side with the FK column)
    // =====================================================
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    // cascade = ALL → if Hotel is deleted, all its Rooms are deleted too
    // orphanRemoval = true → if you remove a Room from this list, it's deleted from DB
    private List<Room> rooms = new ArrayList<>();
}