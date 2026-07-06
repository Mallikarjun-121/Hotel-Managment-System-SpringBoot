package com.hotel.management.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    // Notice: NO password field — never expose this!
    private Set<String> roles;
    private LocalDateTime createdAt;
}