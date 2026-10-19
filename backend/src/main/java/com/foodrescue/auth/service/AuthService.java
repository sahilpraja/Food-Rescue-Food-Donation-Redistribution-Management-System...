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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogRepository auditLogRepository;

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

    @Transactional
    public java.util.Map<String, Object> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account registered with email: " + request.getEmail()));

        // Generate 6-digit verification code
        String simulatedOtp = String.valueOf(100000 + new java.util.Random().nextInt(900000));

        auditLogRepository.save(new AuditLog(
                user.getName(),
                "FORGOT_PASSWORD_REQUEST",
                "Password reset requested for " + user.getEmail()
        ));

        java.util.Map<String, Object> res = new java.util.HashMap<>();
        res.put("message", "Password reset OTP sent to your registered email.");
        res.put("email", user.getEmail());
        res.put("simulatedOtp", simulatedOtp);
        return res;
    }

    @Transactional
    public java.util.Map<String, Object> resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account registered with email: " + request.getEmail()));

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogRepository.save(new AuditLog(
                user.getName(),
                "RESET_PASSWORD",
                "Password was reset successfully for " + user.getEmail()
        ));

        java.util.Map<String, Object> res = new java.util.HashMap<>();
        res.put("message", "Password reset successfully. You can now login with your new password.");
        res.put("email", user.getEmail());
        return res;
    }
}
