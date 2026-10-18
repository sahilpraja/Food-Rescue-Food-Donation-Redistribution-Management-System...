package com.foodrescue.delivery.entity;

import com.foodrescue.claim.entity.Claim;
import com.foodrescue.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "delivery_tasks")
public class DeliveryTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "volunteer_id")
    private User volunteer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryTaskStatus status = DeliveryTaskStatus.OPEN;

    @Column(nullable = false)
    private String pickupOtp;

    @Column(nullable = false)
    private String deliveryOtp;

    @Column(nullable = false)
    private Integer pickupOtpAttempts = 0;

    @Column(nullable = false)
    private Integer deliveryOtpAttempts = 0;

    private Instant assignedAt;
    private Instant pickedAt;
    private Instant deliveredAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public DeliveryTask() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Claim getClaim() { return claim; }
    public void setClaim(Claim claim) { this.claim = claim; }

    public User getVolunteer() { return volunteer; }
    public void setVolunteer(User volunteer) { this.volunteer = volunteer; }

    public DeliveryTaskStatus getStatus() { return status; }
    public void setStatus(DeliveryTaskStatus status) { this.status = status; }

    public String getPickupOtp() { return pickupOtp; }
    public void setPickupOtp(String pickupOtp) { this.pickupOtp = pickupOtp; }

    public String getDeliveryOtp() { return deliveryOtp; }
    public void setDeliveryOtp(String deliveryOtp) { this.deliveryOtp = deliveryOtp; }

    public Integer getPickupOtpAttempts() { return pickupOtpAttempts; }
    public void setPickupOtpAttempts(Integer pickupOtpAttempts) { this.pickupOtpAttempts = pickupOtpAttempts; }

    public Integer getDeliveryOtpAttempts() { return deliveryOtpAttempts; }
    public void setDeliveryOtpAttempts(Integer deliveryOtpAttempts) { this.deliveryOtpAttempts = deliveryOtpAttempts; }

    public Instant getAssignedAt() { return assignedAt; }
    public void setAssignedAt(Instant assignedAt) { this.assignedAt = assignedAt; }

    public Instant getPickedAt() { return pickedAt; }
    public void setPickedAt(Instant pickedAt) { this.pickedAt = pickedAt; }

    public Instant getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(Instant deliveredAt) { this.deliveredAt = deliveredAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
