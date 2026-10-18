package com.foodrescue.claim.repository;

import com.foodrescue.claim.entity.Claim;
import com.foodrescue.claim.entity.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    Optional<Claim> findByListingId(Long listingId);
    List<Claim> findByNgoId(Long ngoId);

    // Concurrency check (BR-02: a listing can have at most one active claim)
    @Query("SELECT c FROM Claim c WHERE c.listing.id = :listingId AND (c.status = 'PENDING' OR c.status = 'ACCEPTED')")
    Optional<Claim> findActiveClaimForListing(@Param("listingId") Long listingId);

    // Pending claims past decision deadline for auto-accept timeout (D5)
    @Query("SELECT c FROM Claim c WHERE c.status = 'PENDING' AND c.decideDeadline <= :now")
    List<Claim> findPendingClaimsPastDeadline(@Param("now") Instant now);
}
