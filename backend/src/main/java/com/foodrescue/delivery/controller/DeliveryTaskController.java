package com.foodrescue.delivery.controller;

import com.foodrescue.common.security.UserPrincipal;
import com.foodrescue.delivery.entity.DeliveryTask;
import com.foodrescue.delivery.service.DeliveryTaskService;
import com.foodrescue.user.entity.User;
import com.foodrescue.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tasks")
@Tag(name = "Delivery Logistics", description = "Volunteer courier task assignment and OTP handover confirmation")
public class DeliveryTaskController {

    private final DeliveryTaskService deliveryTaskService;
    private final UserRepository userRepository;

    public DeliveryTaskController(DeliveryTaskService deliveryTaskService, UserRepository userRepository) {
        this.deliveryTaskService = deliveryTaskService;
        this.userRepository = userRepository;
    }

    @GetMapping("/nearby")
    @Operation(summary = "Get open delivery tasks available for volunteer pickup (FR-DEL-01)")
    public ResponseEntity<List<DeliveryTask>> getNearbyTasks() {
        List<DeliveryTask> list = deliveryTaskService.getOpenTasks();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Get delivery tasks accepted by the authenticated volunteer")
    public ResponseEntity<List<DeliveryTask>> getMyTasks(@AuthenticationPrincipal UserPrincipal principal) {
        User volunteer = userRepository.findById(principal.getId()).orElseThrow();
        List<DeliveryTask> list = deliveryTaskService.getVolunteerTasks(volunteer);
        return ResponseEntity.ok(list);
    }

    @GetMapping
    @Operation(summary = "Get all delivery tasks with optional status filter")
    public ResponseEntity<List<DeliveryTask>> getAllTasks(@RequestParam(required = false) String status) {
        List<DeliveryTask> list = deliveryTaskService.getAllTasks(status);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get delivery task details by ID")
    public ResponseEntity<DeliveryTask> getTaskById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        User caller = principal != null ? userRepository.findById(principal.getId()).orElse(null) : null;
        DeliveryTask task = deliveryTaskService.getTaskById(id, caller);
        return ResponseEntity.ok(task);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    @Operation(summary = "Volunteer unassigns/cancels an accepted delivery task before pickup")
    public ResponseEntity<Map<String, Object>> cancelTaskAssignment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) Map<String, String> body) {

        User caller = userRepository.findById(principal.getId()).orElseThrow();
        String reason = body != null ? body.getOrDefault("reason", "Volunteer unable to deliver") : "Volunteer unable to deliver";
        DeliveryTask task = deliveryTaskService.cancelTaskAssignment(id, caller, reason);
        return ResponseEntity.ok(Map.of(
                "taskId", task.getId(),
                "status", task.getStatus(),
                "message", "Task unassigned and returned to open courier pool."
        ));
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Volunteer accepts an open delivery task (FR-DEL-02)")
    public ResponseEntity<Map<String, Object>> acceptTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        User volunteer = userRepository.findById(principal.getId()).orElseThrow();
        DeliveryTask task = deliveryTaskService.acceptTask(id, volunteer);
        return ResponseEntity.ok(Map.of(
                "taskId", task.getId(),
                "status", task.getStatus(),
                "message", "Task accepted. Please head to donor location for pickup."
        ));
    }

    @PostMapping("/{id}/pickup")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Confirm food pickup with donor's 6-digit OTP (FR-DEL-03, AC-DEL-01)")
    public ResponseEntity<Map<String, Object>> verifyPickup(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String otp = body.getOrDefault("otp", "");
        boolean success = deliveryTaskService.verifyPickupOtp(id, otp);
        return ResponseEntity.ok(Map.of(
                "success", success,
                "message", "Pickup verified successfully! Status is now IN_TRANSIT."
        ));
    }

    @PostMapping("/{id}/deliver")
    @PreAuthorize("hasRole('VOLUNTEER')")
    @Operation(summary = "Confirm food delivery with NGO shelter's 6-digit OTP (FR-DEL-04)")
    public ResponseEntity<Map<String, Object>> verifyDelivery(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String otp = body.getOrDefault("otp", "");
        boolean success = deliveryTaskService.verifyDeliveryOtp(id, otp);
        return ResponseEntity.ok(Map.of(
                "success", success,
                "message", "Delivery verified successfully! Food donation completed."
        ));
    }
}
