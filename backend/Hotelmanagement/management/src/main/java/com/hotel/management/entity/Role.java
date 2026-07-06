package com.hotel.management.entity;

import com.hotel.management.enums.RoleName;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter               // Lombok: generates all getters
@Setter               // Lombok: generates all setters
@NoArgsConstructor    // Lombok: generates empty constructor → required by JPA
@AllArgsConstructor   // Lombok: generates constructor with all fields
@Entity               // JPA: this class maps to a DB table
@Table(name = "roles") // JPA: exact table name in MySQL
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // IDENTITY = use DB auto_increment
    // Other strategies: SEQUENCE (Oracle), TABLE, AUTO
    private Long id;

    @Enumerated(EnumType.STRING)
    // EnumType.STRING → stores "ADMIN" or "CUSTOMER" as text
    // EnumType.ORDINAL → stores 0 or 1 (BAD: breaks if enum order changes)
    @Column(name = "name", nullable = false, unique = true)
    private RoleName name;
}