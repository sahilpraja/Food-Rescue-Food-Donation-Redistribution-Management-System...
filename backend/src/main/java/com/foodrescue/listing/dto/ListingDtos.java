package com.foodrescue.listing.dto;

import com.foodrescue.listing.entity.DietType;
import com.foodrescue.listing.entity.Listing;
import com.foodrescue.listing.entity.ListingStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class ListingDtos {

    public static class CreateListingRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Category is required")
        private String category;

        @NotNull(message = "Diet type is required")
        private DietType dietType;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;

        @NotBlank(message = "Unit is required")
        private String unit;

        private Double weightKg;
        private String packaging;

        @NotNull(message = "Prepared time is required")
        private Instant preparedAt;

        @NotNull(message = "Best before time is required")
        @Future(message = "Best-before time must be in the future")
        private Instant bestBefore;

        private Instant pickupFrom;
        private Instant pickupTo;

        private String addressLine;
        private String city;
        private Double latitude;
        private Double longitude;

        private String allergens;
        private String notes;

        @NotNull(message = "Safety declaration must be acknowledged")
        private Boolean safetyAck;

        private String photoUrl;

        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public DietType getDietType() { return dietType; }
        public void setDietType(DietType dietType) { this.dietType = dietType; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
        public Double getWeightKg() { return weightKg; }
        public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }
        public String getPackaging() { return packaging; }
        public void setPackaging(String packaging) { this.packaging = packaging; }
        public Instant getPreparedAt() { return preparedAt; }
        public void setPreparedAt(Instant preparedAt) { this.preparedAt = preparedAt; }
        public Instant getBestBefore() { return bestBefore; }
        public void setBestBefore(Instant bestBefore) { this.bestBefore = bestBefore; }
        public Instant getPickupFrom() { return pickupFrom; }
        public void setPickupFrom(Instant pickupFrom) { this.pickupFrom = pickupFrom; }
        public Instant getPickupTo() { return pickupTo; }
        public void setPickupTo(Instant pickupTo) { this.pickupTo = pickupTo; }
        public String getAddressLine() { return addressLine; }
        public void setAddressLine(String addressLine) { this.addressLine = addressLine; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        public String getAllergens() { return allergens; }
        public void setAllergens(String allergens) { this.allergens = allergens; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public Boolean getSafetyAck() { return safetyAck; }
        public void setSafetyAck(Boolean safetyAck) { this.safetyAck = safetyAck; }
        public String getPhotoUrl() { return photoUrl; }
        public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    }

    public static class UpdateListingRequest {
        private String title;
        private String category;
        private DietType dietType;
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
        private String unit;
        private Double weightKg;
        private String packaging;
        private Instant preparedAt;
        private Instant bestBefore;
        private Instant pickupFrom;
        private Instant pickupTo;
        private String addressLine;
        private String city;
        private Double latitude;
        private Double longitude;
        private String allergens;
        private String notes;
        private String photoUrl;

        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public DietType getDietType() { return dietType; }
        public void setDietType(DietType dietType) { this.dietType = dietType; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
        public Double getWeightKg() { return weightKg; }
        public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }
        public String getPackaging() { return packaging; }
        public void setPackaging(String packaging) { this.packaging = packaging; }
        public Instant getPreparedAt() { return preparedAt; }
        public void setPreparedAt(Instant preparedAt) { this.preparedAt = preparedAt; }
        public Instant getBestBefore() { return bestBefore; }
        public void setBestBefore(Instant bestBefore) { this.bestBefore = bestBefore; }
        public Instant getPickupFrom() { return pickupFrom; }
        public void setPickupFrom(Instant pickupFrom) { this.pickupFrom = pickupFrom; }
        public Instant getPickupTo() { return pickupTo; }
        public void setPickupTo(Instant pickupTo) { this.pickupTo = pickupTo; }
        public String getAddressLine() { return addressLine; }
        public void setAddressLine(String addressLine) { this.addressLine = addressLine; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        public String getAllergens() { return allergens; }
        public void setAllergens(String allergens) { this.allergens = allergens; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getPhotoUrl() { return photoUrl; }
        public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    }

    public static class ListingResponse {
        private Long id;
        private Long donorId;
        private String donorName;
        private boolean donorVerified;
        private Double donorRating;
        private String donorPhone; // Hidden before claim acceptance!

        private String title;
        private String category;
        private DietType dietType;
        private Integer quantity;
        private String unit;
        private Double weightKg;
        private String packaging;

        private Instant preparedAt;
        private Instant bestBefore;
        private Instant pickupFrom;
        private Instant pickupTo;

        private String addressLine; // Hidden/Approximate before claim acceptance!
        private String city;
        private Double latitude;
        private Double longitude;
        private Double distanceKm;

        private ListingStatus status;
        private String cancelReason;
        private String allergens;
        private String notes;
        private String photoUrl;
        private Instant createdAt;

        public static ListingResponse fromEntity(Listing l, boolean revealAddress, Double distanceKm) {
            ListingResponse r = new ListingResponse();
            r.id = l.getId();
            r.donorId = l.getDonor().getId();
            r.donorName = l.getDonor().getName();
            r.donorVerified = l.getDonor().isVerified();
            r.donorRating = l.getDonor().getRating();

            if (revealAddress) {
                r.donorPhone = l.getDonor().getPhone();
                r.addressLine = l.getAddressLine();
            } else {
                r.donorPhone = "Hidden until claim accepted";
                r.addressLine = l.getCity() != null ? l.getCity() + " Area (Exact location hidden)" : "Approximate Area";
            }

            r.title = l.getTitle();
            r.category = l.getCategory();
            r.dietType = l.getDietType();
            r.quantity = l.getQuantity();
            r.unit = l.getUnit();
            r.weightKg = l.getWeightKg();
            r.packaging = l.getPackaging();
            r.preparedAt = l.getPreparedAt();
            r.bestBefore = l.getBestBefore();
            r.pickupFrom = l.getPickupFrom();
            r.pickupTo = l.getPickupTo();
            r.city = l.getCity();
            r.latitude = l.getLatitude();
            r.longitude = l.getLongitude();
            r.distanceKm = distanceKm;
            r.status = l.getStatus();
            r.cancelReason = l.getCancelReason();
            r.allergens = l.getAllergens();
            r.notes = l.getNotes();
            r.photoUrl = l.getPhotoUrl();
            r.createdAt = l.getCreatedAt();
            return r;
        }

        // Getters
        public Long getId() { return id; }
        public Long getDonorId() { return donorId; }
        public String getDonorName() { return donorName; }
        public boolean isDonorVerified() { return donorVerified; }
        public Double getDonorRating() { return donorRating; }
        public String getDonorPhone() { return donorPhone; }
        public String getTitle() { return title; }
        public String getCategory() { return category; }
        public DietType getDietType() { return dietType; }
        public Integer getQuantity() { return quantity; }
        public String getUnit() { return unit; }
        public Double getWeightKg() { return weightKg; }
        public String getPackaging() { return packaging; }
        public Instant getPreparedAt() { return preparedAt; }
        public Instant getBestBefore() { return bestBefore; }
        public Instant getPickupFrom() { return pickupFrom; }
        public Instant getPickupTo() { return pickupTo; }
        public String getAddressLine() { return addressLine; }
        public String getCity() { return city; }
        public Double getLatitude() { return latitude; }
        public Double getLongitude() { return longitude; }
        public Double getDistanceKm() { return distanceKm; }
        public ListingStatus getStatus() { return status; }
        public String getCancelReason() { return cancelReason; }
        public String getAllergens() { return allergens; }
        public String getNotes() { return notes; }
        public String getPhotoUrl() { return photoUrl; }
        public Instant getCreatedAt() { return createdAt; }
    }
}
