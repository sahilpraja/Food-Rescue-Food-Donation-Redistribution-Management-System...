package com.foodrescue.common.config;

import com.foodrescue.claim.entity.Claim;
import com.foodrescue.claim.entity.ClaimStatus;
import com.foodrescue.claim.entity.PickupMode;
import com.foodrescue.claim.repository.ClaimRepository;
import com.foodrescue.common.audit.AuditLog;
import com.foodrescue.common.audit.AuditLogRepository;
import com.foodrescue.delivery.entity.DeliveryTask;
import com.foodrescue.delivery.entity.DeliveryTaskStatus;
import com.foodrescue.delivery.repository.DeliveryTaskRepository;
import com.foodrescue.listing.entity.DietType;
import com.foodrescue.listing.entity.Listing;
import com.foodrescue.listing.entity.ListingStatus;
import com.foodrescue.listing.repository.ListingRepository;
import com.foodrescue.notification.entity.Notification;
import com.foodrescue.notification.repository.NotificationRepository;
import com.foodrescue.user.entity.Role;
import com.foodrescue.user.entity.User;
import com.foodrescue.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final ClaimRepository claimRepository;
    private final DeliveryTaskRepository deliveryTaskRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ListingRepository listingRepository,
                           ClaimRepository claimRepository,
                           DeliveryTaskRepository deliveryTaskRepository,
                           NotificationRepository notificationRepository,
                           AuditLogRepository auditLogRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.claimRepository = claimRepository;
        this.deliveryTaskRepository = deliveryTaskRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Seed or retrieve Platform Administrator
        User admin = userRepository.findByEmail("admin@foodrescue.org").orElseGet(() -> {
            User u = new User("Platform Administrator", "admin@foodrescue.org", "+91 98111 00000",
                    passwordEncoder.encode("admin123"), Role.ADMIN, true);
            u.setCity("New Delhi");
            u.setAddressLine("Food Rescue Administration HQ, Barakhamba Road");
            return userRepository.save(u);
        });

        // 2. Seed verified food donors (hotels, banquets, restaurants, bakeries)
        User donor1 = userRepository.findByEmail("chef@grandhyattdelhi.com").orElseGet(() -> {
            User u = new User("Grand Hyatt Regency Banquets", "chef@grandhyattdelhi.com", "+91 98101 23456",
                    passwordEncoder.encode("password123"), Role.DONOR, true);
            u.setAddressLine("Grand Hyatt Regency, B-12 Inner Circle, Connaught Place");
            u.setCity("New Delhi");
            u.setLatitude(28.6315);
            u.setLongitude(77.2167);
            u.setFssaiLicense("FSSAI-10019011000542");
            u.setRating(4.9);
            u.setRatingCount(48);
            return userRepository.save(u);
        });

        User donor2 = userRepository.findByEmail("kitchen@saffronspice.com").orElseGet(() -> {
            User u = new User("Saffron Spice Gourmet Dining", "kitchen@saffronspice.com", "+91 98112 34567",
                    passwordEncoder.encode("password123"), Role.DONOR, true);
            u.setAddressLine("Shop 18, Middle Lane, Khan Market");
            u.setCity("New Delhi");
            u.setLatitude(28.6000);
            u.setLongitude(77.2270);
            u.setFssaiLicense("FSSAI-10022011003411");
            u.setRating(4.85);
            u.setRatingCount(36);
            return userRepository.save(u);
        });

        User donor3 = userRepository.findByEmail("bakery@frenchcrust.com").orElseGet(() -> {
            User u = new User("The French Crust Artisan Boulangerie", "bakery@frenchcrust.com", "+91 98711 98765",
                    passwordEncoder.encode("password123"), Role.DONOR, true);
            u.setAddressLine("24 Hauz Khas Village");
            u.setCity("New Delhi");
            u.setLatitude(28.5535);
            u.setLongitude(77.2065);
            u.setFssaiLicense("FSSAI-10021011009876");
            u.setRating(4.92);
            u.setRatingCount(52);
            return userRepository.save(u);
        });

        User donor4 = userRepository.findByEmail("greenleaf@organics.in").orElseGet(() -> {
            User u = new User("Green Leaf Organics & Salad Bar", "greenleaf@organics.in", "+91 98100 87654",
                    passwordEncoder.encode("password123"), Role.DONOR, true);
            u.setAddressLine("Ground Floor, Select Citywalk, Saket");
            u.setCity("New Delhi");
            u.setLatitude(28.5284);
            u.setLongitude(77.2185);
            u.setFssaiLicense("FSSAI-10023011005522");
            u.setRating(4.80);
            u.setRatingCount(29);
            return userRepository.save(u);
        });

        // 3. Seed verified NGOs (shelters, community kitchens)
        User ngo1 = userRepository.findByEmail("director@ashatrust.org").orElseGet(() -> {
            User u = new User("Asha Food Shelter & Care Trust", "director@ashatrust.org", "+91 98765 43210",
                    passwordEncoder.encode("password123"), Role.NGO, true);
            u.setAddressLine("Paharganj Community Care Center, Near Railway Station");
            u.setCity("New Delhi");
            u.setLatitude(28.6430);
            u.setLongitude(77.2140);
            u.setDarpanRegNo("DL/2021/0291884");
            u.setRating(4.95);
            u.setRatingCount(64);
            return userRepository.save(u);
        });

        User ngo2 = userRepository.findByEmail("coordinator@robinhooddelhi.org").orElseGet(() -> {
            User u = new User("Robin Hood Community Relief", "coordinator@robinhooddelhi.org", "+91 98118 76543",
                    passwordEncoder.encode("password123"), Role.NGO, true);
            u.setAddressLine("Community Hall, Okhla Phase III");
            u.setCity("New Delhi");
            u.setLatitude(28.5355);
            u.setLongitude(77.2730);
            u.setDarpanRegNo("DL/2020/0182741");
            u.setRating(4.90);
            u.setRatingCount(41);
            return userRepository.save(u);
        });

        // 4. Seed pending NGO for Admin Verification Queue
        User pendingNgo = userRepository.findByEmail("contact@smilehope.org").orElseGet(() -> {
            User u = new User("Smile & Hope Youth Shelter", "contact@smilehope.org", "+91 98200 11223",
                    passwordEncoder.encode("password123"), Role.NGO, false);
            u.setVerificationStatus("PENDING");
            u.setAddressLine("West Patel Nagar, Main Market");
            u.setCity("New Delhi");
            u.setDarpanRegNo("DL/2024/0987123");
            u.setRating(0.0);
            u.setRatingCount(0);
            return userRepository.save(u);
        });

        // 5. Seed volunteer couriers
        User volunteer1 = userRepository.findByEmail("rahul.courier@foodrescue.org").orElseGet(() -> {
            User u = new User("Rahul Sharma (Express Courier)", "rahul.courier@foodrescue.org", "+91 97110 56789",
                    passwordEncoder.encode("password123"), Role.VOLUNTEER, true);
            u.setAddressLine("Ajmal Khan Road, Karol Bagh");
            u.setCity("New Delhi");
            u.setLatitude(28.6400);
            u.setLongitude(77.1950);
            u.setRating(4.95);
            u.setRatingCount(38);
            return userRepository.save(u);
        });

        User volunteer2 = userRepository.findByEmail("priya.volunteer@foodrescue.org").orElseGet(() -> {
            User u = new User("Priya Singh (Volunteer Courier)", "priya.volunteer@foodrescue.org", "+91 98109 87654",
                    passwordEncoder.encode("password123"), Role.VOLUNTEER, true);
            u.setAddressLine("Central Market, Lajpat Nagar II");
            u.setCity("New Delhi");
            u.setLatitude(28.5600);
            u.setLongitude(77.2200);
            u.setRating(4.90);
            u.setRatingCount(24);
            return userRepository.save(u);
        });

        // Check if we need to seed active listings
        long activeCount = listingRepository.countByStatus(ListingStatus.ACTIVE);
        if (activeCount >= 4) {
            return;
        }

        Instant now = Instant.now();

        // 6. Seed high-quality, photo-rich surplus food listings
        Listing l1 = new Listing();
        l1.setDonor(donor1);
        l1.setTitle("80 Servings Slow-Cooked Dal Makhani & Butter Naan");
        l1.setCategory("Cooked Meals");
        l1.setDietType(DietType.VEG);
        l1.setQuantity(80);
        l1.setUnit("portions");
        l1.setWeightKg(32.0);
        l1.setPackaging("Insulated stainless containers & silver foil packs");
        l1.setPreparedAt(now.minus(60, ChronoUnit.MINUTES));
        l1.setBestBefore(now.plus(210, ChronoUnit.MINUTES)); // ~3.5 hours remaining
        l1.setPickupFrom(now);
        l1.setPickupTo(now.plus(120, ChronoUnit.MINUTES));
        l1.setAddressLine("Grand Hyatt Regency, B-12 Inner Circle, Connaught Place");
        l1.setCity("New Delhi");
        l1.setLatitude(28.6315);
        l1.setLongitude(77.2167);
        l1.setStatus(ListingStatus.ACTIVE);
        l1.setAllergens("Dairy, Gluten");
        l1.setNotes("Surplus from corporate buffet banquet. Prepared boiling hot and maintained in heated warmers at >65°C.");
        l1.setSafetyAck(true);
        l1.setPhotoUrl("https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80");
        listingRepository.save(l1);

        Listing l2 = new Listing();
        l2.setDonor(donor2);
        l2.setTitle("60 Packed Vegetable Dum Biryani with Cooling Mint Raita");
        l2.setCategory("Cooked Meals");
        l2.setDietType(DietType.VEG);
        l2.setQuantity(60);
        l2.setUnit("portions");
        l2.setWeightKg(24.0);
        l2.setPackaging("Eco-friendly disposable meal trays");
        l2.setPreparedAt(now.minus(45, ChronoUnit.MINUTES));
        l2.setBestBefore(now.plus(180, ChronoUnit.MINUTES)); // 3 hours remaining
        l2.setPickupFrom(now);
        l2.setPickupTo(now.plus(90, ChronoUnit.MINUTES));
        l2.setAddressLine("Shop 18, Middle Lane, Khan Market");
        l2.setCity("New Delhi");
        l2.setLatitude(28.6000);
        l2.setLongitude(77.2270);
        l2.setStatus(ListingStatus.ACTIVE);
        l2.setAllergens("Dairy (in raita)");
        l2.setNotes("Prepared fresh for corporate convention. Packed in sterile meal boxes with individual raita cups.");
        l2.setSafetyAck(true);
        l2.setPhotoUrl("https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80");
        listingRepository.save(l2);

        Listing l3 = new Listing();
        l3.setDonor(donor3);
        l3.setTitle("45 Artisanal Sourdough Loaves & Croissant Baskets");
        l3.setCategory("Bakery & Breads");
        l3.setDietType(DietType.VEGAN);
        l3.setQuantity(45);
        l3.setUnit("boxes");
        l3.setWeightKg(15.0);
        l3.setPackaging("Bakery parchment paper & clean food crates");
        l3.setPreparedAt(now.minus(90, ChronoUnit.MINUTES));
        l3.setBestBefore(now.plus(360, ChronoUnit.MINUTES)); // 6 hours remaining
        l3.setPickupFrom(now);
        l3.setPickupTo(now.plus(240, ChronoUnit.MINUTES));
        l3.setAddressLine("24 Hauz Khas Village");
        l3.setCity("New Delhi");
        l3.setLatitude(28.5535);
        l3.setLongitude(77.2065);
        l3.setStatus(ListingStatus.ACTIVE);
        l3.setAllergens("Gluten, Sesame");
        l3.setNotes("Artisan morning bake, crusty rustic sourdough loaves and dinner rolls. Stored dry in sanitized racks.");
        l3.setSafetyAck(true);
        l3.setPhotoUrl("https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80");
        listingRepository.save(l3);

        Listing l4 = new Listing();
        l4.setDonor(donor2);
        l4.setTitle("40 Portions Rich Paneer Butter Masala with Jeera Pulao");
        l4.setCategory("Cooked Meals");
        l4.setDietType(DietType.VEG);
        l4.setQuantity(40);
        l4.setUnit("portions");
        l4.setWeightKg(16.0);
        l4.setPackaging("Individual microwavable tamper-evident boxes");
        l4.setPreparedAt(now.minus(30, ChronoUnit.MINUTES));
        l4.setBestBefore(now.plus(150, ChronoUnit.MINUTES)); // 2.5 hours remaining
        l4.setPickupFrom(now);
        l4.setPickupTo(now.plus(90, ChronoUnit.MINUTES));
        l4.setAddressLine("Shop 18, Middle Lane, Khan Market");
        l4.setCity("New Delhi");
        l4.setLatitude(28.6000);
        l4.setLongitude(77.2270);
        l4.setStatus(ListingStatus.ACTIVE);
        l4.setAllergens("Dairy, Cashews");
        l4.setNotes("Freshly prepared cottage cheese in rich tomato-butter gravy with aromatic jeera rice.");
        l4.setSafetyAck(true);
        l4.setPhotoUrl("https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80");
        listingRepository.save(l4);

        Listing l5 = new Listing();
        l5.setDonor(donor4);
        l5.setTitle("35 Servings Herb Roasted Chicken & Steamed Garden Vegetables");
        l5.setCategory("Cooked Meals");
        l5.setDietType(DietType.NON_VEG);
        l5.setQuantity(35);
        l5.setUnit("portions");
        l5.setWeightKg(14.0);
        l5.setPackaging("Sealed food-grade aluminum containers");
        l5.setPreparedAt(now.minus(60, ChronoUnit.MINUTES));
        l5.setBestBefore(now.plus(240, ChronoUnit.MINUTES)); // 4 hours remaining
        l5.setPickupFrom(now);
        l5.setPickupTo(now.plus(120, ChronoUnit.MINUTES));
        l5.setAddressLine("Ground Floor, Select Citywalk, Saket");
        l5.setCity("New Delhi");
        l5.setLatitude(28.5284);
        l5.setLongitude(77.2185);
        l5.setStatus(ListingStatus.ACTIVE);
        l5.setAllergens("None");
        l5.setNotes("Nutritious lean grilled chicken breast, herb roasted potatoes, and steamed florets.");
        l5.setSafetyAck(true);
        l5.setPhotoUrl("https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop&q=80");
        listingRepository.save(l5);

        // 7. Seed active delivery task (Listing with claim + courier task)
        Listing l6 = new Listing();
        l6.setDonor(donor1);
        l6.setTitle("50 Boxes Multigrain Sandwiches & Fresh Fruit Packs");
        l6.setCategory("Packed Snacks");
        l6.setDietType(DietType.VEG);
        l6.setQuantity(50);
        l6.setUnit("boxes");
        l6.setWeightKg(12.0);
        l6.setPackaging("Biodegradable sandwich clamshells");
        l6.setPreparedAt(now.minus(90, ChronoUnit.MINUTES));
        l6.setBestBefore(now.plus(120, ChronoUnit.MINUTES));
        l6.setPickupFrom(now.minus(30, ChronoUnit.MINUTES));
        l6.setPickupTo(now.plus(60, ChronoUnit.MINUTES));
        l6.setAddressLine("Grand Hyatt Regency, B-12 Inner Circle, Connaught Place");
        l6.setCity("New Delhi");
        l6.setLatitude(28.6315);
        l6.setLongitude(77.2167);
        l6.setStatus(ListingStatus.PICKUP_ASSIGNED);
        l6.setAllergens("Gluten, Dairy");
        l6.setNotes("Assorted grilled vegetable sandwiches and fresh seasonal sliced fruit.");
        l6.setSafetyAck(true);
        l6.setPhotoUrl("https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&auto=format&fit=crop&q=80");
        l6 = listingRepository.save(l6);

        Claim c1 = new Claim();
        c1.setListing(l6);
        c1.setNgo(ngo1);
        c1.setPickupMode(PickupMode.VOLUNTEER);
        c1.setStatus(ClaimStatus.ACCEPTED);
        c1.setDecideDeadline(now.plus(10, ChronoUnit.MINUTES));
        c1.setDecidedAt(now.minus(15, ChronoUnit.MINUTES));
        c1 = claimRepository.save(c1);

        DeliveryTask dt = new DeliveryTask();
        dt.setClaim(c1);
        dt.setVolunteer(volunteer1);
        dt.setStatus(DeliveryTaskStatus.ASSIGNED);
        dt.setPickupOtp("849201");
        dt.setDeliveryOtp("392018");
        dt.setAssignedAt(now.minus(10, ChronoUnit.MINUTES));
        deliveryTaskRepository.save(dt);

        // 8. Seed completed listing for impact metrics
        Listing l7 = new Listing();
        l7.setDonor(donor1);
        l7.setTitle("120 Mix Veg Pulao & Lentil Curry Catering Tubs");
        l7.setCategory("Cooked Meals");
        l7.setDietType(DietType.VEG);
        l7.setQuantity(120);
        l7.setUnit("portions");
        l7.setWeightKg(42.0);
        l7.setPackaging("Heavy duty insulated transport containers");
        l7.setPreparedAt(now.minus(400, ChronoUnit.MINUTES));
        l7.setBestBefore(now.minus(100, ChronoUnit.MINUTES));
        l7.setPickupFrom(now.minus(360, ChronoUnit.MINUTES));
        l7.setPickupTo(now.minus(150, ChronoUnit.MINUTES));
        l7.setAddressLine("Grand Hyatt Regency, B-12 Inner Circle, Connaught Place");
        l7.setCity("New Delhi");
        l7.setLatitude(28.6315);
        l7.setLongitude(77.2167);
        l7.setStatus(ListingStatus.COMPLETED);
        l7.setAllergens("None");
        l7.setNotes("Successfully delivered and served for evening community dinner at Asha Shelter.");
        l7.setSafetyAck(true);
        l7.setPhotoUrl("https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80");
        listingRepository.save(l7);

        // 9. Seed notifications
        notificationRepository.save(new Notification(ngo1, "Surplus Meals Listed Nearby",
                "Grand Hyatt posted 80 servings of Dal Makhani in Connaught Place (2.4 km away).",
                "NEW_LISTING", l1.getId()));
        notificationRepository.save(new Notification(volunteer1, "Transport Task Assigned",
                "You have been assigned to transport 50 meal boxes from Connaught Place to Paharganj Shelter.",
                "TASK_ASSIGNED", l6.getId()));

        // 10. Seed audit log
        auditLogRepository.save(new AuditLog("System Initializer", "SYSTEM_READY",
                "Backend food rescue baseline data initialized with verified partners and live listings"));
    }
}
