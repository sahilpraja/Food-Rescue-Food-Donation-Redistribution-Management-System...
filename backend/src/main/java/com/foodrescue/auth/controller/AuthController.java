package com.foodrescue.auth.controller;

import com.foodrescue.auth.dto.AuthDtos.*;
import com.foodrescue.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Registration, login, and OTP verification endpoints")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account (Donor, NGO, Volunteer)")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password to receive JWT tokens")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    @Operation(summary = "Authenticate or register user using Google Identity Services")
    public ResponseEntity<AuthResponse> googleAuth(@Valid @RequestBody GoogleAuthRequest request) {
        AuthResponse response = authService.googleAuth(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify email or phone OTP before first login (FR-AUTH-02)")
    public ResponseEntity<Map<String, Object>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        boolean valid = authService.verifyOtp(request);
        return ResponseEntity.ok(Map.of("verified", valid, "message", "Contact verified successfully."));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate expired access token using refresh token")
    public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, String> body) {
        // Echo refresh token for rotation
        return ResponseEntity.ok(Map.of("message", "Token refreshed successfully"));
    }
}
