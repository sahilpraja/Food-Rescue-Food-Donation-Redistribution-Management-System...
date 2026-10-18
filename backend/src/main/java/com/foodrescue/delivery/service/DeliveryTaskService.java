package com.foodrescue.delivery.service;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class DeliveryTaskService {

    private final DeliveryTaskRepository deliveryTaskRepository;
    private final ListingRepository listingRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    public DeliveryTaskService(DeliveryTaskRepository deliveryTaskRepository,
                               ListingRepository listingRepository,
                               NotificationRepository notificationRepository,
                               AuditLogRepository auditLogRepository) {
        this.deliveryTaskRepository = deliveryTaskRepository;
        this.listingRepository = listingRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public List<DeliveryTask> getOpenTasks() {
        return deliveryTaskRepository.findByStatus(DeliveryTaskStatus.OPEN);
    }

    public List<DeliveryTask> getVolunteerTasks(User volunteer) {
        return deliveryTaskRepository.findByVolunteerId(volunteer.getId());
    }

    public List<DeliveryTask> getAllTasks(String status) {
        if (status != null && !status.equalsIgnoreCase("ALL")) {
            return deliveryTaskRepository.findByStatus(DeliveryTaskStatus.valueOf(status.toUpperCase()));
        }
        return deliveryTaskRepository.findAll();
    }

    public DeliveryTask getTaskById(Long taskId, User caller) {
        DeliveryTask task = deliveryTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        if (caller != null) {
            boolean isAdmin = caller.getRole() != null && caller.getRole().name().equals("ADMIN");
            boolean isAssignedVolunteer = task.getVolunteer() != null && task.getVolunteer().getId().equals(caller.getId());
            boolean isClaimantNgo = task.getClaim().getNgo().getId().equals(caller.getId());
            boolean isDonor = task.getClaim().getListing().getDonor().getId().equals(caller.getId());

            // Open tasks can be viewed by any authenticated volunteer or user
            if (task.getStatus() != DeliveryTaskStatus.OPEN && !isAdmin && !isAssignedVolunteer && !isClaimantNgo && !isDonor) {
                throw new BadRequestException("You are not authorized to view this delivery task.");
            }
        }

        return task;
    }

    @Transactional
    public DeliveryTask cancelTaskAssignment(Long taskId, User volunteer, String reason) {
        DeliveryTask task = deliveryTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        boolean isAdmin = volunteer.getRole() != null && volunteer.getRole().name().equals("ADMIN");
        boolean isAssignedVolunteer = task.getVolunteer() != null && task.getVolunteer().getId().equals(volunteer.getId());

        if (!isAdmin && !isAssignedVolunteer) {
            throw new BadRequestException("You can only unassign tasks currently assigned to you.");
        }

        if (task.getStatus() != DeliveryTaskStatus.ASSIGNED) {
            throw new BadRequestException("Cannot unassign a task with status: " + task.getStatus() + ". Only ASSIGNED tasks (before pickup) can be unassigned.");
        }

        task.setVolunteer(null);
        task.setStatus(DeliveryTaskStatus.OPEN);
        task.setAssignedAt(null);
        DeliveryTask saved = deliveryTaskRepository.save(task);

        Listing listing = task.getClaim().getListing();
        listing.setStatus(ListingStatus.PICKUP_ASSIGNED);
        listingRepository.save(listing);

        // Notify NGO and Donor that volunteer released task
        notificationRepository.save(new Notification(
                listing.getDonor(),
                "Courier Re-assignment Needed",
                "Volunteer courier had to release delivery task for '" + listing.getTitle() + "': " + (reason != null ? reason : "Courier unavailable") + ". Task returned to open pool.",
                "COURIER_RELEASED",
                listing.getId()
        ));
        notificationRepository.save(new Notification(
                task.getClaim().getNgo(),
                "Courier Re-assignment Needed",
                "Delivery task released: " + (reason != null ? reason : "Courier unavailable") + ". Awaiting new courier pickup.",
                "COURIER_RELEASED",
                listing.getId()
        ));

        auditLogRepository.save(new AuditLog(volunteer.getName(), "CANCELLED_TASK_ASSIGNMENT", "Released task #" + taskId + ": " + (reason != null ? reason : "Courier released")));
        return saved;
    }

    @Transactional
    public DeliveryTask acceptTask(Long taskId, User volunteer) {
        DeliveryTask task = deliveryTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (task.getStatus() != DeliveryTaskStatus.OPEN) {
            throw new BadRequestException("This task has already been accepted by another courier.");
        }

        task.setVolunteer(volunteer);
        task.setStatus(DeliveryTaskStatus.ASSIGNED);
        task.setAssignedAt(Instant.now());

        DeliveryTask saved = deliveryTaskRepository.save(task);

        Listing listing = task.getClaim().getListing();
        listing.setStatus(ListingStatus.PICKUP_ASSIGNED);
        listingRepository.save(listing);

        // Notify Donor and NGO
        notificationRepository.save(new Notification(
                listing.getDonor(),
                "Volunteer Assigned to Pickup",
                volunteer.getName() + " is heading to your kitchen for pickup.",
                "COURIER_ASSIGNED",
                listing.getId()
        ));
        notificationRepository.save(new Notification(
                task.getClaim().getNgo(),
                "Volunteer Courier En Route",
                volunteer.getName() + " will transport your claimed donation.",
                "COURIER_ASSIGNED",
                listing.getId()
        ));

        auditLogRepository.save(new AuditLog(volunteer.getName(), "ACCEPTED_DELIVERY_TASK", "Accepted task #" + taskId));
        return saved;
    }

    @Transactional
    public boolean verifyPickupOtp(Long taskId, String enteredOtp) {
        DeliveryTask task = deliveryTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (task.getPickupOtpAttempts() >= 5) {
            throw new BadRequestException("Maximum OTP attempts exceeded (5 tries). Handover locked.");
        }

        if (!task.getPickupOtp().equals(enteredOtp.trim())) {
            task.setPickupOtpAttempts(task.getPickupOtpAttempts() + 1);
            deliveryTaskRepository.save(task);
            throw new BadRequestException("Invalid pickup OTP. Attempt " + task.getPickupOtpAttempts() + " of 5.");
        }

        // Correct OTP -> Transition to IN_TRANSIT (FR-DEL-03, AC-DEL-01)
        task.setStatus(DeliveryTaskStatus.PICKED_UP);
        task.setPickedAt(Instant.now());
        deliveryTaskRepository.save(task);

        Listing listing = task.getClaim().getListing();
        listing.setStatus(ListingStatus.IN_TRANSIT);
        listingRepository.save(listing);

        notificationRepository.save(new Notification(
                task.getClaim().getNgo(),
                "Food Picked Up! En Route to Shelter",
                task.getVolunteer().getName() + " has picked up the food from the kitchen and is on the way to you.",
                "IN_TRANSIT",
                listing.getId()
        ));

        auditLogRepository.save(new AuditLog(task.getVolunteer().getName(), "CONFIRMED_PICKUP_OTP", "Verified pickup for task #" + taskId));
        return true;
    }

    @Transactional
    public boolean verifyDeliveryOtp(Long taskId, String enteredOtp) {
        DeliveryTask task = deliveryTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (task.getDeliveryOtpAttempts() >= 5) {
            throw new BadRequestException("Maximum OTP attempts exceeded (5 tries).");
        }

        if (!task.getDeliveryOtp().equals(enteredOtp.trim())) {
            task.setDeliveryOtpAttempts(task.getDeliveryOtpAttempts() + 1);
            deliveryTaskRepository.save(task);
            throw new BadRequestException("Invalid delivery OTP. Attempt " + task.getDeliveryOtpAttempts() + " of 5.");
        }

        // Correct OTP -> Transition to DELIVERED and COMPLETED (FR-DEL-04)
        task.setStatus(DeliveryTaskStatus.DELIVERED);
        task.setDeliveredAt(Instant.now());
        deliveryTaskRepository.save(task);

        Listing listing = task.getClaim().getListing();
        listing.setStatus(ListingStatus.COMPLETED);
        listingRepository.save(listing);

        // Notify Donor and NGO
        notificationRepository.save(new Notification(
                listing.getDonor(),
                "Food Rescued & Delivered Successfully! 🎉",
                "Your donation of " + listing.getQuantity() + " " + listing.getUnit() + " was delivered safely to " + task.getClaim().getNgo().getName() + ".",
                "DONATION_COMPLETED",
                listing.getId()
        ));

        auditLogRepository.save(new AuditLog(task.getVolunteer().getName(), "COMPLETED_DELIVERY", "Verified delivery for task #" + taskId));
        return true;
    }
}
