package com.foodrescue.claim.entity;

import com.foodrescue.listing.entity.Listing;
import com.foodrescue.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ngo_id", nullable = false)
    private User ngo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PickupMode pickupMode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus status = ClaimStatus.PENDING;

    private Instant decideDeadline;
    private Instant decidedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Claim() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Listing getListing() { return listing; }
    public void setListing(Listing listing) { this.listing = listing; }

    public User getNgo() { return ngo; }
    public void setNgo(User ngo) { this.ngo = ngo; }

    public PickupMode getPickupMode() { return pickupMode; }
    public void setPickupMode(PickupMode pickupMode) { this.pickupMode = pickupMode; }

    public ClaimStatus getStatus() { return status; }
    public void setStatus(ClaimStatus status) { this.status = status; }

    public Instant getDecideDeadline() { return decideDeadline; }
    public void setDecideDeadline(Instant decideDeadline) { this.decideDeadline = decideDeadline; }

    public Instant getDecidedAt() { return decidedAt; }
    public void setDecidedAt(Instant decidedAt) { this.decidedAt = decidedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
