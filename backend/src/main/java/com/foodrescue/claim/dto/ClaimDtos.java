package com.foodrescue.claim.dto;

import com.foodrescue.claim.entity.Claim;
import com.foodrescue.claim.entity.ClaimStatus;
import com.foodrescue.claim.entity.PickupMode;

import java.time.Instant;

public class ClaimDtos {

    public static class UpdateClaimRequest {
        private PickupMode pickupMode;

        public PickupMode getPickupMode() { return pickupMode; }
        public void setPickupMode(PickupMode pickupMode) { this.pickupMode = pickupMode; }
    }

    public static class ClaimResponse {
        private Long id;
        private Long listingId;
        private String listingTitle;
        private String listingCategory;
        private Integer listingQuantity;
        private String listingUnit;
        private Instant bestBefore;

        private Long donorId;
        private String donorName;
        private String donorPhone;
        private String donorAddress;

        private Long ngoId;
        private String ngoName;
        private String ngoPhone;

        private PickupMode pickupMode;
        private ClaimStatus status;
        private Instant decideDeadline;
        private Instant decidedAt;
        private Instant createdAt;

        public static ClaimResponse fromEntity(Claim c, boolean revealDonorDetails) {
            ClaimResponse r = new ClaimResponse();
            r.id = c.getId();
            r.listingId = c.getListing().getId();
            r.listingTitle = c.getListing().getTitle();
            r.listingCategory = c.getListing().getCategory();
            r.listingQuantity = c.getListing().getQuantity();
            r.listingUnit = c.getListing().getUnit();
            r.bestBefore = c.getListing().getBestBefore();

            r.donorId = c.getListing().getDonor().getId();
            r.donorName = c.getListing().getDonor().getName();

            if (revealDonorDetails || c.getStatus() == ClaimStatus.ACCEPTED) {
                r.donorPhone = c.getListing().getDonor().getPhone();
                r.donorAddress = c.getListing().getAddressLine();
            } else {
                r.donorPhone = "Hidden until claim accepted";
                r.donorAddress = c.getListing().getCity() != null ? c.getListing().getCity() + " Area" : "Approximate Location";
            }

            r.ngoId = c.getNgo().getId();
            r.ngoName = c.getNgo().getName();
            r.ngoPhone = c.getNgo().getPhone();

            r.pickupMode = c.getPickupMode();
            r.status = c.getStatus();
            r.decideDeadline = c.getDecideDeadline();
            r.decidedAt = c.getDecidedAt();
            r.createdAt = c.getCreatedAt();
            return r;
        }

        // Getters
        public Long getId() { return id; }
        public Long getListingId() { return listingId; }
        public String getListingTitle() { return listingTitle; }
        public String getListingCategory() { return listingCategory; }
        public Integer getListingQuantity() { return listingQuantity; }
        public String getListingUnit() { return listingUnit; }
        public Instant getBestBefore() { return bestBefore; }
        public Long getDonorId() { return donorId; }
        public String getDonorName() { return donorName; }
        public String getDonorPhone() { return donorPhone; }
        public String getDonorAddress() { return donorAddress; }
        public Long getNgoId() { return ngoId; }
        public String getNgoName() { return ngoName; }
        public String getNgoPhone() { return ngoPhone; }
        public PickupMode getPickupMode() { return pickupMode; }
        public ClaimStatus getStatus() { return status; }
        public Instant getDecideDeadline() { return decideDeadline; }
        public Instant getDecidedAt() { return decidedAt; }
        public Instant getCreatedAt() { return createdAt; }
    }
}
