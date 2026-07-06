package com.hotel.management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder              // Lombok: lets you build objects like:
// User.builder().name("John").email("j@j.com").build()
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    // unique = true → DB creates a UNIQUE constraint on this column
    private String email;

    @Column(name = "password", nullable = false)
    private String password;   // Will store BCrypt hashed password, never plain text!

    @Column(name = "phone", length = 15)
    private String phone;

    @CreationTimestamp
    // Hibernate auto-sets this to current timestamp on INSERT
    // You never set this manually
    @Column(name = "created_at", updatable = false)
    // updatable = false → this column never changes after creation
    private LocalDateTime createdAt;

    // =====================================================
    // MANY-TO-MANY: User ↔ Role
    // One user can have many roles (ADMIN + CUSTOMER)
    // One role can belong to many users
    // =====================================================
    @ManyToMany(fetch = FetchType.EAGER)
    // EAGER = load roles immediately when user is loaded
    // LAZY  = load roles only when you call user.getRoles()
    // For roles, EAGER is fine because we always need them for security
    @JoinTable(
            name = "user_roles",              // name of the bridge table
            joinColumns = @JoinColumn(name = "user_id"),        // FK to this entity
            inverseJoinColumns = @JoinColumn(name = "role_id")  // FK to Role entity
    )
    private Set<Role> roles = new HashSet<>();
    // HashSet prevents duplicate roles for a user
}