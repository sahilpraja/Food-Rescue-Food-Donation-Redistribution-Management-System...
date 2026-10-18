package com.foodrescue.rating.repository;

import com.foodrescue.rating.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByToUserId(Long toUserId);
    List<Rating> findByListingId(Long listingId);
}
