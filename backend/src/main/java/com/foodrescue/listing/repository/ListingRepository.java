package com.foodrescue.listing.repository;

import com.foodrescue.listing.entity.Listing;
import com.foodrescue.listing.entity.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByDonorId(Long donorId);
    List<Listing> findByStatus(ListingStatus status);
    long countByStatus(ListingStatus status);

    // Active listings before expiry
    @Query("SELECT l FROM Listing l WHERE l.status = 'ACTIVE' AND l.bestBefore > :now ORDER BY l.bestBefore ASC")
    List<Listing> findActiveListings(@Param("now") Instant now);

    // Expired listings candidate for automatic expiry background task (BR-03)
    @Query("SELECT l FROM Listing l WHERE (l.status = 'ACTIVE' OR l.status = 'CLAIMED') AND l.bestBefore <= :now")
    List<Listing> findExpiredListingsCandidate(@Param("now") Instant now);
}
