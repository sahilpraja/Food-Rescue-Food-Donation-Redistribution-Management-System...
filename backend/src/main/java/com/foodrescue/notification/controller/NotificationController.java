package com.foodrescue.notification.controller;

import com.foodrescue.common.security.UserPrincipal;
import com.foodrescue.notification.entity.Notification;
import com.foodrescue.notification.repository.NotificationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "In-app notifications inbox and read state")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    @Operation(summary = "Get notification inbox for authenticated user (FR-NOT-01)")
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal UserPrincipal principal) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(principal.getId());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<Map<String, String>> markRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Map<String, String>> markAllRead(@AuthenticationPrincipal UserPrincipal principal) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(principal.getId());
        for (Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
