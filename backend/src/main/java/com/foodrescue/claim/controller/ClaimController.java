package com.foodrescue.claim.controller;

import com.foodrescue.claim.entity.Claim;
import com.foodrescue.claim.entity.PickupMode;
import com.foodrescue.claim.service.ClaimService;
import com.foodrescue.common.security.UserPrincipal;
import com.foodrescue.user.entity.User;
import com.foodrescue.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Claims", description = "NGO food claiming and donor decision workflows")
public class ClaimController {

    private final ClaimService claimService;
    private final UserRepository userRepository;

    public ClaimController(ClaimService claimService, UserRepository userRepository) {
        this.claimService = claimService;
        this.userRepository = userRepository;
    }

    @PostMapping("/listings/{id}/claims")
    @PreAuthorize("hasRole('NGO')")
    @Operation(summary = "Submit a claim on an active food listing (FR-CLM-01)")
    public ResponseEntity<Map<String, Object>> claimListing(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) Map<String, String> body) {

        User ngo = userRepository.findById(principal.getId()).orElseThrow();
        String modeStr = body != null ? body.getOrDefault("pickupMode", "VOLUNTEER") : "VOLUNTEER";
        PickupMode mode = PickupMode.valueOf(modeStr.toUpperCase());

        Claim claim = claimService.claimListing(id, ngo, mode);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "claimId", claim.getId(),
                "status", claim.getStatus(),
                "pickupMode", claim.getPickupMode(),
                "message", "Claim submitted successfully. Awaiting donor confirmation."
        ));
    }

    @PostMapping("/claims/{id}/accept")
    @PreAuthorize("hasRole('DONOR')")
    @Operation(summary = "Donor accepts NGO claim (FR-CLM-02)")
    public ResponseEntity<Map<String, Object>> acceptClaim(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        User donor = userRepository.findById(principal.getId()).orElseThrow();
        Claim claim = claimService.decideClaim(id, donor, true, null);
        return ResponseEntity.ok(Map.of(
                "claimId", claim.getId(),
                "status", claim.getStatus(),
                "message", "Claim accepted. Address and contact info unlocked for receiver."
        ));
    }

    @PostMapping("/claims/{id}/decline")
    @PreAuthorize("hasRole('DONOR')")
    @Operation(summary = "Donor declines claim; listing reverts to ACTIVE")
    public ResponseEntity<Map<String, Object>> declineClaim(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) Map<String, String> body) {

        User donor = userRepository.findById(principal.getId()).orElseThrow();
        String reason = body != null ? body.get("reason") : "Declined by kitchen";
        Claim claim = claimService.decideClaim(id, donor, false, reason);
        return ResponseEntity.ok(Map.of(
                "claimId", claim.getId(),
                "status", claim.getStatus(),
                "message", "Claim declined. Listing restored to available status."
        ));
    }

    @GetMapping("/claims/mine")
    @PreAuthorize("hasRole('NGO')")
    @Operation(summary = "Get all food claims made by the authenticated NGO")
    public ResponseEntity<List<com.foodrescue.claim.dto.ClaimDtos.ClaimResponse>> getMyClaims(
            @AuthenticationPrincipal UserPrincipal principal) {

        User ngo = userRepository.findById(principal.getId()).orElseThrow();
        List<com.foodrescue.claim.dto.ClaimDtos.ClaimResponse> list = claimService.getMyClaims(ngo);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/claims/{id}")
    @Operation(summary = "Get details of a specific claim")
    public ResponseEntity<com.foodrescue.claim.dto.ClaimDtos.ClaimResponse> getClaimById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        User caller = principal != null ? userRepository.findById(principal.getId()).orElse(null) : null;
        com.foodrescue.claim.dto.ClaimDtos.ClaimResponse response = claimService.getClaimById(id, caller);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/claims/listing/{listingId}")
    @Operation(summary = "Get claim associated with a specific food listing")
    public ResponseEntity<com.foodrescue.claim.dto.ClaimDtos.ClaimResponse> getClaimForListing(
            @PathVariable Long listingId,
            @AuthenticationPrincipal UserPrincipal principal) {

        User caller = principal != null ? userRepository.findById(principal.getId()).orElse(null) : null;
        com.foodrescue.claim.dto.ClaimDtos.ClaimResponse response = claimService.getClaimForListing(listingId, caller);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/claims/{id}")
    @PreAuthorize("hasRole('NGO')")
    @Operation(summary = "Update pending claim details (e.g. pickup mode)")
    public ResponseEntity<com.foodrescue.claim.dto.ClaimDtos.ClaimResponse> updateClaim(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody com.foodrescue.claim.dto.ClaimDtos.UpdateClaimRequest request) {

        User ngo = userRepository.findById(principal.getId()).orElseThrow();
        com.foodrescue.claim.dto.ClaimDtos.ClaimResponse response = claimService.updateClaim(id, ngo, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/claims/{id}")
    @PreAuthorize("hasAnyRole('NGO', 'ADMIN')")
    @Operation(summary = "Cancel or withdraw a pending claim")
    public ResponseEntity<Map<String, String>> cancelClaim(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String reason) {

        User caller = userRepository.findById(principal.getId()).orElseThrow();
        claimService.cancelClaim(id, caller, reason != null ? reason : "Withdrawn by NGO");
        return ResponseEntity.ok(Map.of("message", "Claim cancelled successfully. Listing restored to available."));
    }

    @PostMapping("/claims/{id}/cancel")
    @PreAuthorize("hasAnyRole('NGO', 'ADMIN')")
    @Operation(summary = "Cancel a pending claim (POST alternative)")
    public ResponseEntity<Map<String, String>> cancelClaimPost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) Map<String, String> body) {

        User caller = userRepository.findById(principal.getId()).orElseThrow();
        String reason = body != null ? body.getOrDefault("reason", "Withdrawn by NGO") : "Withdrawn by NGO";
        claimService.cancelClaim(id, caller, reason);
        return ResponseEntity.ok(Map.of("message", "Claim cancelled successfully. Listing restored to available."));
    }
}
