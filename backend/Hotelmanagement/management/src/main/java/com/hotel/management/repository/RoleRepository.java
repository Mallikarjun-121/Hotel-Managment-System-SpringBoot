package com.hotel.management.repository;

import com.hotel.management.entity.Role;
import com.hotel.management.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    // Used when assigning a role to a new user during registration
    // SELECT * FROM roles WHERE name = ?
    Optional<Role> findByName(RoleName name);
}