package com.foodrescue.claim.service;

import com.foodrescue.claim.entity.Claim;
import com.foodrescue.claim.entity.ClaimStatus;
import com.foodrescue.claim.entity.PickupMode;
import com.foodrescue.claim.repository.ClaimRepository;
import com.foodrescue.common.audit.AuditLog;
import com.foodrescue.common.audit.AuditLogRepository;
import com.foodrescue.common.exception.BadRequestException;
import com.foodrescue.common.exception.ResourceNotFoundException;
import com.foodrescue.delivery.entity.DeliveryTask;
import com.foodrescue.delivery.entity.DeliveryTaskStatus;
import com.foodrescue.delivery.repository.DeliveryTaskRepository;
import com.foodrescue.listing.entity.Listing;
import com.foodrescue.listing.entity.ListingStatus;
import com.foodrescue.listing.repository.ListingRepository;
import com.foodrescue.notification.entity.Notification;
import com.foodrescue.notification.repository.NotificationRepository;
import com.foodrescue.user.entity.User;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ListingRepository listingRepository;
    private final DeliveryTaskRepository deliveryTaskRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final SecureRandom random = new SecureRandom();

    public ClaimService(ClaimRepository claimRepository,
                        ListingRepository listingRepository,
                        DeliveryTaskRepository deliveryTaskRepository,
                        NotificationRepository notificationRepository,
                        AuditLogRepository auditLogRepository) {
        this.claimRepository = claimRepository;
        this.listingRepository = listingRepository;
        this.deliveryTaskRepository = deliveryTaskRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public Claim claimListing(Long listingId, User ngo, PickupMode pickupMode) {
        // Business Rule 1: Only verified NGOs may claim listings (BR-01)
        if (!ngo.isVerified()) {
            throw new BadRequestException("Only verified NGOs are authorized to claim food donations (BR-01).");
        }

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new BadRequestException("Listing is no longer available or already claimed.");
        }

        // Business Rule 2: At most one active claim per listing (BR-02)
        if (claimRepository.findActiveClaimForListing(listingId).isPresent()) {
            throw new BadRequestException("This listing has already been claimed.");
        }

        Claim claim = new Claim();
        claim.setListing(listing);
        claim.setNgo(ngo);
        claim.setPickupMode(pickupMode != null ? pickupMode : PickupMode.VOLUNTEER);
        claim.setStatus(ClaimStatus.PENDING);
        claim.setDecideDeadline(Instant.now().plus(10, ChronoUnit.MINUTES)); // 10-minute timeout (Brain.md D5)

        Claim saved = claimRepository.save(claim);

        listing.setStatus(ListingStatus.CLAIMED);
        listingRepository.save(listing);

        // Notify Donor
        notificationRepository.save(new Notification(
                listing.getDonor(),
                "Claim Request Received!",
                ngo.getName() + " requested to claim '" + listing.getTitle() + "'. Please accept within 10 minutes.",
                "CLAIM_RECEIVED",
                listingId
        ));

        auditLogRepository.save(new AuditLog(ngo.getName(), "CLAIMED_LISTING", "Claimed listing #" + listingId + " (" + pickupMode + ")"));

        return saved;
    }

    @Transactional
    public Claim decideClaim(Long claimId, User donor, boolean accept, String reason) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        Listing listing = claim.getListing();
        if (!listing.getDonor().getId().equals(donor.getId())) {
            throw new BadRequestException("You can only decide claims on your own listings.");
        }

        if (!accept) {
            claim.setStatus(ClaimStatus.DECLINED);
            claim.setDecidedAt(Instant.now());
            claimRepository.save(claim);

            listing.setStatus(ListingStatus.ACTIVE); // Return to active for other NGOs
            listingRepository.save(listing);

            notificationRepository.save(new Notification(
                    claim.getNgo(),
                    "Claim Declined",
                    "Donor declined claim for '" + listing.getTitle() + "': " + (reason != null ? reason : "Unavailable"),
                    "CLAIM_DECLINED",
                    listing.getId()
            ));

            auditLogRepository.save(new AuditLog(donor.getName(), "DECLINED_CLAIM", "Declined claim #" + claimId));
            return claim;
        }

        // Accept claim
        claim.setStatus(ClaimStatus.ACCEPTED);
        claim.setDecidedAt(Instant.now());
        claimRepository.save(claim);

        if (claim.getPickupMode() == PickupMode.VOLUNTEER) {
            listing.setStatus(ListingStatus.PICKUP_ASSIGNED);

            // Create open delivery task with secure 6-digit OTPs
            DeliveryTask task = new DeliveryTask();
            task.setClaim(claim);
            task.setStatus(DeliveryTaskStatus.OPEN);
            task.setPickupOtp(generate6DigitOtp());
            task.setDeliveryOtp(generate6DigitOtp());
            deliveryTaskRepository.save(task);
        } else {
            // Self pickup mode
            listing.setStatus(ListingStatus.CLAIMED);
        }

        listingRepository.save(listing);

        // Notify NGO that exact building address is now unlocked
        notificationRepository.save(new Notification(
                claim.getNgo(),
                "Claim Accepted by Donor! 🎉",
                "Your claim for '" + listing.getTitle() + "' is confirmed. Exact donor address and contact are unlocked.",
                "CLAIM_ACCEPTED",
                listing.getId()
        ));

        auditLogRepository.save(new AuditLog(donor.getName(), "ACCEPTED_CLAIM", "Accepted claim #" + claimId));
        return claim;
    }

    public List<com.foodrescue.claim.dto.ClaimDtos.ClaimResponse> getMyClaims(User ngo) {
        List<Claim> claims = claimRepository.findByNgoId(ngo.getId());
        return claims.stream()
                .map(c -> com.foodrescue.claim.dto.ClaimDtos.ClaimResponse.fromEntity(c, c.getStatus() == ClaimStatus.ACCEPTED))
                .toList();
    }

    public com.foodrescue.claim.dto.ClaimDtos.ClaimResponse getClaimById(Long id, User caller) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        boolean isAdmin = caller != null && caller.getRole() != null && caller.getRole().name().equals("ADMIN");
        boolean isNgo = caller != null && claim.getNgo().getId().equals(caller.getId());
        boolean isDonor = caller != null && claim.getListing().getDonor().getId().equals(caller.getId());

        if (!isAdmin && !isNgo && !isDonor) {
            throw new BadRequestException("You are not authorized to view this claim.");
        }

        return com.foodrescue.claim.dto.ClaimDtos.ClaimResponse.fromEntity(claim, isDonor || claim.getStatus() == ClaimStatus.ACCEPTED);
    }

    public com.foodrescue.claim.dto.ClaimDtos.ClaimResponse getClaimForListing(Long listingId, User caller) {
        Claim claim = claimRepository.findByListingId(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("No claim found for listing #" + listingId));

        boolean isAdmin = caller != null && caller.getRole() != null && caller.getRole().name().equals("ADMIN");
        boolean isNgo = caller != null && claim.getNgo().getId().equals(caller.getId());
        boolean isDonor = caller != null && claim.getListing().getDonor().getId().equals(caller.getId());

        if (!isAdmin && !isNgo && !isDonor) {
            throw new BadRequestException("You are not authorized to view this claim.");
        }

        return com.foodrescue.claim.dto.ClaimDtos.ClaimResponse.fromEntity(claim, isDonor || claim.getStatus() == ClaimStatus.ACCEPTED);
    }

    @Transactional
    public com.foodrescue.claim.dto.ClaimDtos.ClaimResponse updateClaim(Long id, User ngo, com.foodrescue.claim.dto.ClaimDtos.UpdateClaimRequest request) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        boolean isAdmin = ngo.getRole() != null && ngo.getRole().name().equals("ADMIN");
        if (!claim.getNgo().getId().equals(ngo.getId()) && !isAdmin) {
            throw new BadRequestException("You can only modify your own claims.");
        }

        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new BadRequestException("Cannot update claim with status: " + claim.getStatus() + ". Only PENDING claims can be modified.");
        }

        if (request.getPickupMode() != null) {
            claim.setPickupMode(request.getPickupMode());
        }

        Claim saved = claimRepository.save(claim);
        auditLogRepository.save(new AuditLog(ngo.getName(), "UPDATED_CLAIM", "Updated claim #" + id + " pickupMode to " + saved.getPickupMode()));
        return com.foodrescue.claim.dto.ClaimDtos.ClaimResponse.fromEntity(saved, false);
    }

    @Transactional
    public void cancelClaim(Long id, User caller, String reason) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        boolean isAdmin = caller.getRole() != null && caller.getRole().name().equals("ADMIN");
        boolean isNgo = claim.getNgo().getId().equals(caller.getId());
        if (!isNgo && !isAdmin) {
            throw new BadRequestException("You can only cancel your own claims.");
        }

        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new BadRequestException("Only PENDING claims can be cancelled. Contact support or donor for accepted claims.");
        }

        claim.setStatus(ClaimStatus.CANCELLED);
        claim.setDecidedAt(Instant.now());
        claimRepository.save(claim);

        // Restore listing back to ACTIVE
        Listing listing = claim.getListing();
        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);

        // Notify donor
        notificationRepository.save(new Notification(
                listing.getDonor(),
                "Claim Withdrawn",
                claim.getNgo().getName() + " withdrew their claim on '" + listing.getTitle() + "'. Listing is available again.",
                "CLAIM_WITHDRAWN",
                listing.getId()
        ));

        auditLogRepository.save(new AuditLog(caller.getName(), "CANCELLED_CLAIM", "Cancelled claim #" + id + ": " + (reason != null ? reason : "Withdrawn by NGO")));
    }

    // Auto-accept claim timeout scheduler (D5: 10 min then auto-accept)
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void autoAcceptStaleClaims() {
        List<Claim> pending = claimRepository.findPendingClaimsPastDeadline(Instant.now());
        for (Claim c : pending) {
            c.setStatus(ClaimStatus.ACCEPTED);
            c.setDecidedAt(Instant.now());
            claimRepository.save(c);

            Listing l = c.getListing();
            if (c.getPickupMode() == PickupMode.VOLUNTEER) {
                l.setStatus(ListingStatus.PICKUP_ASSIGNED);
                DeliveryTask task = new DeliveryTask();
                task.setClaim(c);
                task.setStatus(DeliveryTaskStatus.OPEN);
                task.setPickupOtp(generate6DigitOtp());
                task.setDeliveryOtp(generate6DigitOtp());
                deliveryTaskRepository.save(task);
            }
            listingRepository.save(l);

            auditLogRepository.save(new AuditLog("System Auto-Engine", "AUTO_ACCEPTED_CLAIM", "Auto-accepted claim #" + c.getId() + " upon 10-minute timeout"));
        }
    }

    private String generate6DigitOtp() {
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}
