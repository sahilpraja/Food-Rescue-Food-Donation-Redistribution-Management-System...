package com.foodrescue.listing.service;

import com.foodrescue.common.audit.AuditLog;
import com.foodrescue.common.audit.AuditLogRepository;
import com.foodrescue.common.exception.BadRequestException;
import com.foodrescue.common.exception.ResourceNotFoundException;
import com.foodrescue.listing.dto.ListingDtos.*;
import com.foodrescue.listing.entity.Listing;
import com.foodrescue.listing.entity.ListingStatus;
import com.foodrescue.listing.repository.ListingRepository;
import com.foodrescue.user.entity.User;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class ListingService {

    private final ListingRepository listingRepository;
    private final AuditLogRepository auditLogRepository;

    public ListingService(ListingRepository listingRepository, AuditLogRepository auditLogRepository) {
        this.listingRepository = listingRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public ListingResponse createListing(User donor, CreateListingRequest request) {
        // Business Rule validation: best-before must be after prepared-at (FR-LST-02)
        if (request.getBestBefore().isBefore(request.getPreparedAt()) || request.getBestBefore().equals(request.getPreparedAt())) {
            throw new BadRequestException("Best-before time must be later than prepared-at time.");
        }

        // Pickup window must end before best-before (FR-LST-03)
        if (request.getPickupTo() != null && request.getPickupTo().isAfter(request.getBestBefore())) {
            throw new BadRequestException("Pickup window must end before best-before expiry time.");
        }

        if (Boolean.FALSE.equals(request.getSafetyAck())) {
            throw new BadRequestException("Food safety declaration acknowledgment is mandatory (BR-04).");
        }

        Listing listing = new Listing();
        listing.setDonor(donor);
        listing.setTitle(request.getTitle());
        listing.setCategory(request.getCategory());
        listing.setDietType(request.getDietType());
        listing.setQuantity(request.getQuantity());
        listing.setUnit(request.getUnit());

        double weight = request.getWeightKg() != null ? request.getWeightKg() : (request.getQuantity() * 0.35);
        listing.setWeightKg(weight);

        listing.setPackaging(request.getPackaging());
        listing.setPreparedAt(request.getPreparedAt());
        listing.setBestBefore(request.getBestBefore());
        listing.setPickupFrom(request.getPickupFrom() != null ? request.getPickupFrom() : Instant.now());
        listing.setPickupTo(request.getPickupTo() != null ? request.getPickupTo() : request.getBestBefore());

        listing.setAddressLine(request.getAddressLine() != null ? request.getAddressLine() : donor.getAddressLine());
        listing.setCity(request.getCity() != null ? request.getCity() : donor.getCity());
        listing.setLatitude(request.getLatitude() != null ? request.getLatitude() : donor.getLatitude());
        listing.setLongitude(request.getLongitude() != null ? request.getLongitude() : donor.getLongitude());

        listing.setStatus(ListingStatus.ACTIVE);
        listing.setAllergens(request.getAllergens());
        listing.setNotes(request.getNotes());
        listing.setSafetyAck(true);
        listing.setPhotoUrl(request.getPhotoUrl() != null ? request.getPhotoUrl() : "https://images.unsplash.com/photo-1546833999-b9f581a1996d");

        Listing saved = listingRepository.save(listing);

        auditLogRepository.save(new AuditLog(donor.getName(), "CREATED_LISTING", "Created offer: " + saved.getTitle() + " (ID: " + saved.getId() + ")"));

        return ListingResponse.fromEntity(saved, true, 0.0);
    }

    public List<ListingResponse> findNearby(Double lat, Double lng, Double radiusKm, String category, String diet) {
        List<Listing> active = listingRepository.findActiveListings(Instant.now());
        List<ListingResponse> result = new ArrayList<>();

        double userLat = lat != null ? lat : 28.6430;
        double userLng = lng != null ? lng : 77.2140;
        double maxRadius = radiusKm != null ? radiusKm : 10.0;

        for (Listing l : active) {
            if (category != null && !category.equalsIgnoreCase("All Categories") && !category.equalsIgnoreCase(l.getCategory())) {
                continue;
            }
            if (diet != null && !diet.equalsIgnoreCase("ALL") && !diet.equalsIgnoreCase(l.getDietType().name())) {
                continue;
            }

            double dist = calculateDistance(userLat, userLng, l.getLatitude(), l.getLongitude());
            if (dist <= maxRadius) {
                // By default exact address is hidden for discovery before claim acceptance (Brain.md #2)
                result.add(ListingResponse.fromEntity(l, false, Math.round(dist * 10.0) / 10.0));
            }
        }

        return result;
    }

    public ListingResponse getById(Long id, User caller) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + id));

        boolean revealAddress = false;
        if (caller != null) {
            // Reveal if caller is the donor, an admin, or an accepted claim holder
            if (caller.getId().equals(listing.getDonor().getId()) || caller.getRole().name().equals("ADMIN")) {
                revealAddress = true;
            } else if (listing.getStatus() != ListingStatus.ACTIVE && listing.getStatus() != ListingStatus.EXPIRED) {
                revealAddress = true; // Claim accepted
            }
        }

        return ListingResponse.fromEntity(listing, revealAddress, 1.5);
    }

    public List<ListingResponse> getMyListings(User donor) {
        List<Listing> list = listingRepository.findByDonorId(donor.getId());
        return list.stream().map(l -> ListingResponse.fromEntity(l, true, 0.0)).toList();
    }

    public List<ListingResponse> getAllListings(String status, String category) {
        List<Listing> list = listingRepository.findAll();
        return list.stream()
                .filter(l -> status == null || status.equalsIgnoreCase("ALL") || l.getStatus().name().equalsIgnoreCase(status))
                .filter(l -> category == null || category.equalsIgnoreCase("ALL") || category.equalsIgnoreCase("All Categories") || l.getCategory().equalsIgnoreCase(category))
                .map(l -> ListingResponse.fromEntity(l, true, 0.0))
                .toList();
    }

    @Transactional
    public ListingResponse updateListing(Long id, User caller, UpdateListingRequest request) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + id));

        boolean isAdmin = caller.getRole() != null && caller.getRole().name().equals("ADMIN");
        if (!listing.getDonor().getId().equals(caller.getId()) && !isAdmin) {
            throw new BadRequestException("You are not authorized to update this listing.");
        }

        if (listing.getStatus() == ListingStatus.COMPLETED || listing.getStatus() == ListingStatus.DELIVERED) {
            throw new BadRequestException("Cannot edit a listing that has already been delivered or completed.");
        }

        if (listing.getStatus() == ListingStatus.CANCELLED) {
            throw new BadRequestException("Cannot edit a cancelled listing.");
        }

        if (listing.getStatus() == ListingStatus.IN_TRANSIT) {
            throw new BadRequestException("Listing is already in transit with courier and cannot be modified.");
        }

        // Validate time windows if provided
        Instant prepTime = request.getPreparedAt() != null ? request.getPreparedAt() : listing.getPreparedAt();
        Instant expiryTime = request.getBestBefore() != null ? request.getBestBefore() : listing.getBestBefore();
        Instant pickupToTime = request.getPickupTo() != null ? request.getPickupTo() : listing.getPickupTo();

        if (expiryTime.isBefore(prepTime) || expiryTime.equals(prepTime)) {
            throw new BadRequestException("Best-before time must be later than prepared-at time.");
        }

        if (pickupToTime != null && pickupToTime.isAfter(expiryTime)) {
            throw new BadRequestException("Pickup window must end before best-before expiry time.");
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            listing.setTitle(request.getTitle().trim());
        }
        if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
            listing.setCategory(request.getCategory().trim());
        }
        if (request.getDietType() != null) {
            listing.setDietType(request.getDietType());
        }
        if (request.getQuantity() != null && request.getQuantity() > 0) {
            listing.setQuantity(request.getQuantity());
            if (request.getWeightKg() != null) {
                listing.setWeightKg(request.getWeightKg());
            } else {
                listing.setWeightKg(request.getQuantity() * 0.35);
            }
        } else if (request.getWeightKg() != null) {
            listing.setWeightKg(request.getWeightKg());
        }

        if (request.getUnit() != null) listing.setUnit(request.getUnit());
        if (request.getPackaging() != null) listing.setPackaging(request.getPackaging());
        if (request.getPreparedAt() != null) listing.setPreparedAt(request.getPreparedAt());
        if (request.getBestBefore() != null) listing.setBestBefore(request.getBestBefore());
        if (request.getPickupFrom() != null) listing.setPickupFrom(request.getPickupFrom());
        if (request.getPickupTo() != null) listing.setPickupTo(request.getPickupTo());
        if (request.getAddressLine() != null) listing.setAddressLine(request.getAddressLine());
        if (request.getCity() != null) listing.setCity(request.getCity());
        if (request.getLatitude() != null) listing.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) listing.setLongitude(request.getLongitude());
        if (request.getAllergens() != null) listing.setAllergens(request.getAllergens());
        if (request.getNotes() != null) listing.setNotes(request.getNotes());
        if (request.getPhotoUrl() != null) listing.setPhotoUrl(request.getPhotoUrl());

        Listing saved = listingRepository.save(listing);
        auditLogRepository.save(new AuditLog(caller.getName(), "UPDATED_LISTING", "Updated listing #" + saved.getId() + " (" + saved.getTitle() + ")"));

        return ListingResponse.fromEntity(saved, true, 0.0);
    }

    @Transactional
    public void deleteListing(Long id, User caller) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + id));

        boolean isAdmin = caller.getRole() != null && caller.getRole().name().equals("ADMIN");
        if (!listing.getDonor().getId().equals(caller.getId()) && !isAdmin) {
            throw new BadRequestException("You are not authorized to delete this listing.");
        }

        if (listing.getStatus() == ListingStatus.IN_TRANSIT || listing.getStatus() == ListingStatus.DELIVERED || listing.getStatus() == ListingStatus.COMPLETED) {
            throw new BadRequestException("Cannot delete donation that has already been dispatched or delivered.");
        }

        // Soft-delete/cancel with status CANCELLED to preserve history for safety audits
        listing.setStatus(ListingStatus.CANCELLED);
        listing.setCancelReason("Deleted by " + (isAdmin ? "admin: " + caller.getName() : "donor"));
        listingRepository.save(listing);

        auditLogRepository.save(new AuditLog(caller.getName(), "DELETED_LISTING", "Removed/cancelled listing #" + id + " (" + listing.getTitle() + ")"));
    }

    @Transactional
    public void cancelListing(Long id, User donor, String reason) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        boolean isAdmin = donor.getRole() != null && donor.getRole().name().equals("ADMIN");
        if (!listing.getDonor().getId().equals(donor.getId()) && !isAdmin) {
            throw new BadRequestException("You can only cancel your own listings.");
        }

        listing.setStatus(ListingStatus.CANCELLED);
        listing.setCancelReason(reason != null ? reason : "Cancelled by donor");
        listingRepository.save(listing);

        auditLogRepository.save(new AuditLog(donor.getName(), "CANCELLED_LISTING", "Cancelled listing #" + id + ": " + reason));
    }

    // Auto-Expiry Job running every minute (BR-03, FR-LST-06)
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void autoExpireListings() {
        List<Listing> expiredCandidates = listingRepository.findExpiredListingsCandidate(Instant.now());
        for (Listing l : expiredCandidates) {
            l.setStatus(ListingStatus.EXPIRED);
            listingRepository.save(l);
            auditLogRepository.save(new AuditLog("System Auto-Engine", "AUTO_EXPIRED_LISTING", "Expired listing #" + l.getId() + " past best-before time"));
        }
    }

    private double calculateDistance(double lat1, double lon1, Double lat2, Double lon2) {
        if (lat2 == null || lon2 == null) return 1.5;
        double earthRadius = 6371; // km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }
}
