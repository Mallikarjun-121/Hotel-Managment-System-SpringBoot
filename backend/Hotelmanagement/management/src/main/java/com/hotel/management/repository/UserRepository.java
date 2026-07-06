package com.hotel.management.repository;

import com.hotel.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
// @Repository marks this as a Spring-managed bean
// Also translates DB exceptions into Spring's DataAccessException hierarchy
// Technically optional when extending JpaRepository, but good practice
public interface UserRepository extends JpaRepository<User, Long> {
    // JpaRepository<User, Long>
    //   User → which entity this repository manages
    //   Long → the type of the primary key (@Id field)

    // -------------------------------------------------------
    // METHOD NAME DERIVATION:
    // Spring sees "findByEmail" → generates:
    // SELECT * FROM users WHERE email = ?
    // Optional<> means result might be null — forces you to handle it
    // -------------------------------------------------------
    Optional<User> findByEmail(String email);

    // -------------------------------------------------------
    // Checks if a user exists with this email
    // Used during registration to prevent duplicates
    // SELECT COUNT(*) > 0 FROM users WHERE email = ?
    // -------------------------------------------------------
    boolean existsByEmail(String email);

    // -------------------------------------------------------
    // JPQL Query: load user WITH roles in one query
    // Without this, accessing user.getRoles() fires a
    // separate SQL (N+1 problem)
    // JOIN FETCH = load roles eagerly in same query
    // -------------------------------------------------------
    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.email = :email")
    Optional<User> findByEmailWithRoles(@Param("email") String email);
}