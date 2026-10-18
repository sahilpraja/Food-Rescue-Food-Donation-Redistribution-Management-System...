package com.foodrescue.delivery.repository;

import com.foodrescue.delivery.entity.DeliveryTask;
import com.foodrescue.delivery.entity.DeliveryTaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryTaskRepository extends JpaRepository<DeliveryTask, Long> {
    Optional<DeliveryTask> findByClaimId(Long claimId);
    List<DeliveryTask> findByStatus(DeliveryTaskStatus status);
    List<DeliveryTask> findByVolunteerId(Long volunteerId);
}
