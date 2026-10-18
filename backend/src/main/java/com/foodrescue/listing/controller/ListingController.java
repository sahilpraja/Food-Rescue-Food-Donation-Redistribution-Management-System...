package com.foodrescue.listing.controller;

import com.foodrescue.common.security.UserPrincipal;
import com.foodrescue.listing.dto.ListingDtos.*;
import com.foodrescue.listing.service.ListingService;
import com.foodrescue.user.entity.User;
import com.foodrescue.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/listings")
@Tag(name = "Listings", description = "Donation listing creation, discovery, and lifecycle management")
public class ListingController {

    private final ListingService listingService;
    private final UserRepository userRepository;

    public ListingController(ListingService listingService, UserRepository userRepository) {
        this.listingService = listingService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasRole('DONOR')")
    @Operation(summary = "Create a new surplus food donation listing (FR-LST-01)")
    public ResponseEntity<ListingResponse> createListing(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateListingRequest request) {

        User donor = userRepository.findById(principal.getId()).orElseThrow();
        ListingResponse response = listingService.createListing(donor, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/nearby")
    @Operation(summary = "Discover active surplus food listings within radius (FR-DIS-01)")
    public ResponseEntity<List<ListingResponse>> getNearby(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(defaultValue = "10.0") Double radiusKm,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String diet) {

        List<ListingResponse> list = listingService.findNearby(lat, lng, radiusKm, category, diet);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed information about a listing (address masked before claim)")
    public ResponseEntity<ListingResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        User caller = principal != null ? userRepository.findById(principal.getId()).orElse(null) : null;
        ListingResponse response = listingService.getById(id, caller);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('DONOR')")
    @Operation(summary = "Get all listings posted by the authenticated donor")
    public ResponseEntity<List<ListingResponse>> getMyListings(@AuthenticationPrincipal UserPrincipal principal) {
        User donor = userRepository.findById(principal.getId()).orElseThrow();
        List<ListingResponse> list = listingService.getMyListings(donor);
        return ResponseEntity.ok(list);
    }

    @GetMapping
    @Operation(summary = "Get all listings with optional status and category filters")
    public ResponseEntity<List<ListingResponse>> getAllListings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category) {
        List<ListingResponse> list = listingService.getAllListings(status, category);
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    @Operation(summary = "Update an existing surplus food donation listing")
    public ResponseEntity<ListingResponse> updateListing(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateListingRequest request) {

        User caller = userRepository.findById(principal.getId()).orElseThrow();
        ListingResponse response = listingService.updateListing(id, caller, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    @Operation(summary = "Delete or cancel a listing according to status and business rules")
    public ResponseEntity<Map<String, String>> deleteListing(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        User caller = userRepository.findById(principal.getId()).orElseThrow();
        listingService.deleteListing(id, caller);
        return ResponseEntity.ok(Map.of("message", "Listing deleted/cancelled successfully"));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    @Operation(summary = "Cancel a listing before it is fulfilled")
    public ResponseEntity<Map<String, String>> cancelListing(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) Map<String, String> body) {

        User donor = userRepository.findById(principal.getId()).orElseThrow();
        String reason = body != null ? body.getOrDefault("reason", "Cancelled by donor") : "Cancelled by donor";
        listingService.cancelListing(id, donor, reason);
        return ResponseEntity.ok(Map.of("message", "Listing cancelled successfully"));
    }
}
