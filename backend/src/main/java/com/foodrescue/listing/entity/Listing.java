package com.foodrescue.listing.entity;

import com.foodrescue.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "listings")
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "donor_id", nullable = false)
    private User donor;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DietType dietType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private String unit;

    private Double weightKg;

    private String packaging;

    @Column(nullable = false)
    private Instant preparedAt;

    @Column(nullable = false)
    private Instant bestBefore;

    private Instant pickupFrom;
    private Instant pickupTo;

    private String addressLine;
    private String city;
    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingStatus status = ListingStatus.ACTIVE;

    private String allergens; // Comma-separated
    private String notes;

    @Column(nullable = false)
    private boolean safetyAck = true;

    private String photoUrl;

    private String cancelReason;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Listing() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getDonor() { return donor; }
    public void setDonor(User donor) { this.donor = donor; }

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

    public ListingStatus getStatus() { return status; }
    public void setStatus(ListingStatus status) { this.status = status; }

    public String getAllergens() { return allergens; }
    public void setAllergens(String allergens) { this.allergens = allergens; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public boolean isSafetyAck() { return safetyAck; }
    public void setSafetyAck(boolean safetyAck) { this.safetyAck = safetyAck; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
