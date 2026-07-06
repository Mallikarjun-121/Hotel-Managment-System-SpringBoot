package com.hotel.management.service.impl;

import com.hotel.management.dto.request.LoginRequest;
import com.hotel.management.dto.request.RegisterRequest;
import com.hotel.management.dto.response.AuthResponse;
import com.hotel.management.dto.response.UserResponse;
import com.hotel.management.entity.Role;
import com.hotel.management.entity.User;
import com.hotel.management.enums.RoleName;
import com.hotel.management.exception.DuplicateResourceException;
import com.hotel.management.exception.ResourceNotFoundException;
import com.hotel.management.mapper.UserMapper;
import com.hotel.management.repository.RoleRepository;
import com.hotel.management.repository.UserRepository;
import com.hotel.management.security.CustomUserDetailsService;
import com.hotel.management.security.JwtUtil;
import com.hotel.management.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final UserMapper userMapper;

    @Override
    public UserResponse register(RegisterRequest request) {

        // 1. Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already registered: " + request.getEmail());
        }

        // 2. Assign CUSTOMER role by default
        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role CUSTOMER not found. Please seed roles first."));

        // 3. Build user entity
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // BCrypt hash
                .phone(request.getPhone())
                .roles(new HashSet<>(Set.of(customerRole)))
                .build();

        // 4. Save
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        // 1. Authenticate — throws exception if wrong credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Load full UserDetails (with roles)
        UserDetails userDetails =
                userDetailsService.loadUserByUsername(request.getEmail());

        // 3. Generate JWT
        String token = jwtUtil.generateToken(userDetails);

        // 4. Get user entity for response details
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        // 5. Build response
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(user.getRoles().stream()
                        .map(r -> r.getName().name())
                        .collect(Collectors.toSet()))
                .build();
    }
}