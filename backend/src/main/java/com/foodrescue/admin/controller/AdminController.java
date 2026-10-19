package com.foodrescue.admin.controller;

import com.foodrescue.common.audit.AuditLog;
import com.foodrescue.common.audit.AuditLogRepository;
import com.foodrescue.common.exception.BadRequestException;
import com.foodrescue.common.exception.ResourceNotFoundException;
import com.foodrescue.common.security.UserPrincipal;
import com.foodrescue.notification.entity.Notification;
import com.foodrescue.notification.repository.NotificationRepository;
import com.foodrescue.rating.entity.Report;
import com.foodrescue.rating.repository.ReportRepository;
import com.foodrescue.user.entity.User;
import com.foodrescue.user.repository.UserRepository;
import com.foodrescue.auth.dto.AuthDtos.RegisterAdminRequest;
import com.foodrescue.user.entity.Role;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Operations", description = "Organization verification queue, safety moderation, and audit trail")
public class AdminController {

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final com.foodrescue.listing.service.ListingService listingService;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository,
                           ReportRepository reportRepository,
                           AuditLogRepository auditLogRepository,
                           NotificationRepository notificationRepository,
                           com.foodrescue.listing.service.ListingService listingService,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.reportRepository = reportRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
        this.listingService = listingService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/verifications")
    @Operation(summary = "Get list of organizations pending credential verification (FR-ADM-01)")
    public ResponseEntity<List<User>> getPendingVerifications() {
        List<User> pending = userRepository.findByVerificationStatus("PENDING");
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/verifications/{id}/approve")
    @Operation(summary = "Approve organization verification")
    public ResponseEntity<Map<String, String>> approveVerification(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal admin) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setVerified(true);
        user.setVerificationStatus("APPROVED");
        userRepository.save(user);

        notificationRepository.save(new Notification(
                user,
                "Verification Approved! 🎉",
                "Your organization credentials have been verified by platform admins. You can now claim surplus food offers.",
                "VERIFICATION_APPROVED",
                user.getId()
        ));

        auditLogRepository.save(new AuditLog(admin.getName(), "APPROVED_VERIFICATION", "Approved " + user.getName() + " (" + user.getRole() + ")"));

        return ResponseEntity.ok(Map.of("message", "Organization approved successfully"));
    }

    @PostMapping("/verifications/{id}/reject")
    @Operation(summary = "Reject organization verification with mandatory reason (FR-VER-03)")
    public ResponseEntity<Map<String, String>> rejectVerification(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal admin,
            @RequestBody Map<String, String> body) {

        String reason = body.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            throw new BadRequestException("Rejection reason is mandatory (FR-VER-03).");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setVerified(false);
        user.setVerificationStatus("REJECTED");
        user.setRejectReason(reason);
        userRepository.save(user);

        notificationRepository.save(new Notification(
                user,
                "Verification Application Rejected",
                "Your verification was rejected: " + reason + ". Please update documents.",
                "VERIFICATION_REJECTED",
                user.getId()
        ));

        auditLogRepository.save(new AuditLog(admin.getName(), "REJECTED_VERIFICATION", "Rejected " + user.getName() + ": " + reason));

        return ResponseEntity.ok(Map.of("message", "Organization verification rejected with reason recorded."));
    }

    @GetMapping("/reports")
    @Operation(summary = "Get incident reports queue (FR-ADM-02)")
    public ResponseEntity<List<Report>> getReports(@RequestParam(defaultValue = "PENDING") String status) {
        List<Report> reports = reportRepository.findByStatusOrderByCreatedAtDesc(status);
        return ResponseEntity.ok(reports);
    }

    @PostMapping("/reports/{id}/resolve")
    @Operation(summary = "Resolve safety incident report with action taken (FR-RAT-03)")
    public ResponseEntity<Map<String, String>> resolveReport(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal admin,
            @RequestBody Map<String, String> body) {

        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        String action = body.getOrDefault("action", "DISMISSED");
        String note = body.getOrDefault("note", "Resolved by admin");

        report.setStatus("RESOLVED");
        report.setActionTaken(action);
        report.setAdminNote(note);
        report.setResolvedAt(Instant.now());
        reportRepository.save(report);

        auditLogRepository.save(new AuditLog(admin.getName(), "RESOLVED_REPORT", "Resolved report #" + id + " (" + action + "): " + note));

        return ResponseEntity.ok(Map.of("message", "Report resolved successfully"));
    }

    @GetMapping("/audit")
    @Operation(summary = "Search system audit log (FR-ADM-05)")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        List<AuditLog> logs = auditLogRepository.findAllByOrderByTimestampDesc();
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/listings")
    @Operation(summary = "Admin view of all listings across the platform")
    public ResponseEntity<List<com.foodrescue.listing.dto.ListingDtos.ListingResponse>> getAllListings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category) {
        List<com.foodrescue.listing.dto.ListingDtos.ListingResponse> list = listingService.getAllListings(status, category);
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/listings/{id}")
    @Operation(summary = "Admin moderates/removes an unsafe listing")
    public ResponseEntity<Map<String, String>> deleteListing(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal admin,
            @RequestParam(required = false) String reason) {

        User adminUser = userRepository.findById(admin.getId()).orElseThrow();
        listingService.cancelListing(id, adminUser, reason != null ? reason : "Removed by administrator for safety/compliance");
        return ResponseEntity.ok(Map.of("message", "Listing removed by admin successfully"));
    }

    @GetMapping("/users")
    @Operation(summary = "Get list of all platform users and organizations")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers(
            @RequestParam(required = false) String role) {

        List<User> users;
        if (role != null && !role.equalsIgnoreCase("ALL")) {
            users = userRepository.findByRole(com.foodrescue.user.entity.Role.valueOf(role.toUpperCase()));
        } else {
            users = userRepository.findAll();
        }

        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("phone", u.getPhone());
            map.put("role", u.getRole());
            map.put("verified", u.isVerified());
            map.put("verificationStatus", u.getVerificationStatus());
            map.put("city", u.getCity());
            map.put("rating", u.getRating());
            map.put("ratingCount", u.getRatingCount());
            map.put("darpanRegNo", u.getDarpanRegNo());
            map.put("fssaiLicense", u.getFssaiLicense());
            map.put("createdAt", u.getCreatedAt());
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Admin updates user verification status")
    public ResponseEntity<Map<String, String>> updateUserStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal admin,
            @RequestBody Map<String, Object> body) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (body.containsKey("verified")) {
            user.setVerified(Boolean.parseBoolean(body.get("verified").toString()));
        }
        if (body.containsKey("verificationStatus")) {
            user.setVerificationStatus(body.get("verificationStatus").toString());
        }
        userRepository.save(user);

        auditLogRepository.save(new AuditLog(admin.getName(), "UPDATED_USER_STATUS", "Updated status of user #" + id + " (" + user.getName() + ")"));
        return ResponseEntity.ok(Map.of("message", "User status updated successfully"));
    }

    @PostMapping("/register-admin")
    @Operation(summary = "Register a new platform administrator")
    public ResponseEntity<Map<String, Object>> registerAdmin(
            @AuthenticationPrincipal UserPrincipal admin,
            @Valid @RequestBody RegisterAdminRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with email " + request.getEmail() + " already exists.");
        }

        User newAdmin = new User(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                passwordEncoder.encode(request.getPassword()),
                Role.ADMIN,
                true
        );

        newAdmin.setCity(request.getCity() != null && !request.getCity().isBlank() ? request.getCity() : "New Delhi");
        newAdmin.setVerificationStatus("APPROVED");

        User saved = userRepository.save(newAdmin);

        auditLogRepository.save(new AuditLog(
                admin.getName(),
                "REGISTERED_ADMIN",
                "Admin " + admin.getName() + " registered new platform administrator: " + saved.getName() + " (" + saved.getEmail() + ")"
        ));

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("message", "New platform administrator registered successfully.");
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        result.put("email", saved.getEmail());
        result.put("phone", saved.getPhone());
        result.put("role", saved.getRole());
        result.put("createdAt", saved.getCreatedAt());

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }
}
