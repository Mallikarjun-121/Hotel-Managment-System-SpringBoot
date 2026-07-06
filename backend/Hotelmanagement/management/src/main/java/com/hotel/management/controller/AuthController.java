package com.hotel.management.controller;

import com.hotel.management.dto.request.LoginRequest;
import com.hotel.management.dto.request.RegisterRequest;
import com.hotel.management.dto.response.AuthResponse;
import com.hotel.management.dto.response.UserResponse;
import com.hotel.management.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
// @RestController = @Controller + @ResponseBody
// Every method returns JSON automatically

@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "APIs for user registration and login")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        // @Valid triggers validation annotations in RegisterRequest
        // @RequestBody deserializes JSON body into Java object
        return ResponseEntity
                .status(HttpStatus.CREATED)  // 201
                .body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request)); // 200
    }
}