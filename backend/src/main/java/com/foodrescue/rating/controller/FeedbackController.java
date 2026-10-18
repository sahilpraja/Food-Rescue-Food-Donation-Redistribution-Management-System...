package com.foodrescue.rating.controller;

import com.foodrescue.common.audit.AuditLog;
import com.foodrescue.common.audit.AuditLogRepository;
import com.foodrescue.common.exception.ResourceNotFoundException;
import com.foodrescue.common.security.UserPrincipal;
import com.foodrescue.listing.entity.Listing;
import com.foodrescue.listing.repository.ListingRepository;
import com.foodrescue.rating.entity.Rating;
import com.foodrescue.rating.entity.Report;
import com.foodrescue.rating.repository.RatingRepository;
import com.foodrescue.rating.repository.ReportRepository;
import com.foodrescue.user.entity.User;
import com.foodrescue.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Feedback & Reports", description = "Post-delivery ratings and safety incident reports")
public class FeedbackController {

    private final RatingRepository ratingRepository;
    private final ReportRepository reportRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public FeedbackController(RatingRepository ratingRepository,
                              ReportRepository reportRepository,
                              ListingRepository listingRepository,
                              UserRepository userRepository,
                              AuditLogRepository auditLogRepository) {
        this.ratingRepository = ratingRepository;
        this.reportRepository = reportRepository;
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @PostMapping("/ratings")
    @Operation(summary = "Submit rating for food donor or courier after completion (FR-RAT-01)")
    public ResponseEntity<Map<String, Object>> submitRating(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> body) {

        User fromUser = userRepository.findById(principal.getId()).orElseThrow();
        Long listingId = Long.valueOf(body.get("listingId").toString());
        Long toUserId = Long.valueOf(body.get("toUserId").toString());
        Integer score = Integer.valueOf(body.get("score").toString());
        String comment = (String) body.get("comment");

        Listing listing = listingRepository.findById(listingId).orElseThrow();
        User toUser = userRepository.findById(toUserId).orElseThrow();

        Rating rating = new Rating();
        rating.setListing(listing);
        rating.setFromUser(fromUser);
        rating.setToUser(toUser);
        rating.setScore(score);
        rating.setComment(comment);
        ratingRepository.save(rating);

        // Update running average rating on user
        double newRating = (toUser.getRating() * toUser.getRatingCount() + score) / (toUser.getRatingCount() + 1);
        toUser.setRating(Math.round(newRating * 100.0) / 100.0);
        toUser.setRatingCount(toUser.getRatingCount() + 1);
        userRepository.save(toUser);

        auditLogRepository.save(new AuditLog(fromUser.getName(), "SUBMITTED_RATING", "Rated " + toUser.getName() + " " + score + " stars"));

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Rating submitted successfully"));
    }

    @PostMapping("/reports")
    @Operation(summary = "Report an unsafe listing or user conduct issue (FR-RAT-02)")
    public ResponseEntity<Map<String, Object>> submitReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> body) {

        User reporter = userRepository.findById(principal.getId()).orElseThrow();
        String targetType = (String) body.get("targetType");
        Long targetId = Long.valueOf(body.get("targetId").toString());
        String targetTitle = (String) body.get("targetTitle");
        String reason = (String) body.get("reason");

        Report report = new Report();
        report.setReporter(reporter);
        report.setTargetType(targetType);
        report.setTargetId(targetId);
        report.setTargetTitle(targetTitle);
        report.setReason(reason);
        report.setStatus("PENDING");
        reportRepository.save(report);

        auditLogRepository.save(new AuditLog(reporter.getName(), "FILED_REPORT", "Reported " + targetType + " #" + targetId));

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Report submitted for admin review"));
    }
}
