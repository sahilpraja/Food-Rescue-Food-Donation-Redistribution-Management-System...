package com.foodrescue.auth.service;

import com.foodrescue.auth.dto.AuthDtos.*;
import com.foodrescue.common.audit.AuditLog;
import com.foodrescue.common.audit.AuditLogRepository;
import com.foodrescue.common.exception.BadRequestException;
import com.foodrescue.common.exception.ResourceNotFoundException;
import com.foodrescue.common.security.JwtTokenProvider;
import com.foodrescue.user.entity.Role;
import com.foodrescue.user.entity.User;
import com.foodrescue.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogRepository auditLogRepository;

    @Value("${app.admin.registration-secret:FOODRESCUE_ADMIN_2025}")
    private String adminRegistrationSecret;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists.");
        }

        if (request.getRole() == Role.ADMIN) {
            if (request.getAdminSecret() == null || !request.getAdminSecret().trim().equals(adminRegistrationSecret.trim())) {
                throw new BadRequestException("Invalid Admin Security Passcode. Only authorized platform administrators may register with this role.");
            }
        }

        boolean autoVerify = request.getRole() == Role.DONOR || request.getRole() == Role.VOLUNTEER || request.getRole() == Role.ADMIN;

        User user = new User(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole(),
                autoVerify
        );

        user.setAddressLine(request.getAddressLine());
        user.setCity(request.getCity() != null ? request.getCity() : "New Delhi");
        user.setDarpanRegNo(request.getDarpanRegNo());
        user.setFssaiLicense(request.getFssaiLicense());

        User saved = userRepository.save(user);

        auditLogRepository.save(new AuditLog(saved.getName(), "REGISTERED_ACCOUNT", "Created " + saved.getRole() + " account"));

        String access = tokenProvider.generateAccessToken(saved.getEmail(), saved.getRole().name(), saved.getId());
        String refresh = tokenProvider.generateRefreshToken(saved.getEmail());

        return new AuthResponse(access, refresh, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole(), saved.isVerified());
    }

    @Transactional
    public AuthResponse googleAuth(GoogleAuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            Role role = request.getRole() != null ? request.getRole() : Role.DONOR;
            if (role == Role.ADMIN) {
                if (request.getAdminSecret() == null || !request.getAdminSecret().trim().equals(adminRegistrationSecret.trim())) {
                    throw new BadRequestException("Invalid Admin Security Passcode for administrator Google registration.");
                }
            }

            boolean autoVerify = role == Role.DONOR || role == Role.VOLUNTEER || role == Role.ADMIN;
            String displayName = request.getName() != null && !request.getName().isBlank()
                    ? request.getName().trim()
                    : email.split("@")[0];
            String phone = request.getPhone() != null && !request.getPhone().isBlank()
                    ? request.getPhone()
                    : "+00 00000 00000";

            String randomPass = UUID.randomUUID().toString();

            user = new User(
                    displayName,
                    email,
                    phone,
                    passwordEncoder.encode(randomPass),
                    role,
                    autoVerify
            );
            user.setCity(request.getCity() != null ? request.getCity() : "New Delhi");
            user = userRepository.save(user);

            auditLogRepository.save(new AuditLog(user.getName(), "REGISTERED_ACCOUNT_GOOGLE", "Created " + user.getRole() + " account via Google Sign-In"));
        }

        String access = tokenProvider.generateAccessToken(user.getEmail(), user.getRole().name(), user.getId());
        String refresh = tokenProvider.generateRefreshToken(user.getEmail());

        return new AuthResponse(access, refresh, user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isVerified());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password.");
        }

        String access = tokenProvider.generateAccessToken(user.getEmail(), user.getRole().name(), user.getId());
        String refresh = tokenProvider.generateRefreshToken(user.getEmail());

        return new AuthResponse(access, refresh, user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isVerified());
    }

    @Transactional
    public boolean verifyOtp(OtpVerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        // Simulated valid OTP for development and testing
        return true;
    }
}
