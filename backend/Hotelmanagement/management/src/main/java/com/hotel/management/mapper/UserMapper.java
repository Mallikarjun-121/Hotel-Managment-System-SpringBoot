package com.hotel.management.mapper;

import com.hotel.management.dto.response.UserResponse;
import com.hotel.management.entity.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
// @Component makes this a Spring bean so we can @Autowired it in services
public class UserMapper {

    // Entity → ResponseDTO
    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .roles(user.getRoles()
                        .stream()
                        .map(role -> role.getName().name()) // RoleName enum → String
                        .collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .build();
    }
}