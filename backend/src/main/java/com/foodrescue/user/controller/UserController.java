package com.foodrescue.user.controller;

import com.foodrescue.common.security.UserPrincipal;
import com.foodrescue.user.entity.User;
import com.foodrescue.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Profiles", description = "User profile and partner credential management")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    @Operation(summary = "Get profile of the currently authenticated user")
    public ResponseEntity<User> getCurrentUserProfile(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId()).orElseThrow();
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get public partner profile by user ID")
    public ResponseEntity<Map<String, Object>> getUserProfile(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        Map<String, Object> profile = new java.util.HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("role", user.getRole());
        profile.put("city", user.getCity());
        profile.put("verified", user.isVerified());
        profile.put("rating", user.getRating());
        profile.put("ratingCount", user.getRatingCount());
        profile.put("verificationStatus", user.getVerificationStatus());
        if (user.getFssaiLicense() != null) profile.put("fssaiLicense", user.getFssaiLicense());
        if (user.getDarpanRegNo() != null) profile.put("darpanRegNo", user.getDarpanRegNo());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @Operation(summary = "Update display name, address, or phone number (FR-AUTH-06)")
    public ResponseEntity<User> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> body) {

        User user = userRepository.findById(principal.getId()).orElseThrow();
        if (body.containsKey("name") && body.get("name") != null && !body.get("name").trim().isEmpty()) {
            user.setName(body.get("name").trim());
        }
        if (body.containsKey("phone") && body.get("phone") != null) {
            user.setPhone(body.get("phone").trim());
        }
        if (body.containsKey("addressLine") && body.get("addressLine") != null) {
            user.setAddressLine(body.get("addressLine").trim());
        }
        if (body.containsKey("city") && body.get("city") != null) {
            user.setCity(body.get("city").trim());
        }
        if (body.containsKey("fssaiLicense")) {
            user.setFssaiLicense(body.get("fssaiLicense"));
        }
        if (body.containsKey("darpanRegNo")) {
            user.setDarpanRegNo(body.get("darpanRegNo"));
        }
        if (body.containsKey("latitude") && body.get("latitude") != null) {
            try { user.setLatitude(Double.parseDouble(body.get("latitude"))); } catch (Exception ignored) {}
        }
        if (body.containsKey("longitude") && body.get("longitude") != null) {
            try { user.setLongitude(Double.parseDouble(body.get("longitude"))); } catch (Exception ignored) {}
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }
}
