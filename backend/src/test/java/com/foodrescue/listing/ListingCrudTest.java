package com.foodrescue.listing;

import com.foodrescue.FoodRescueApplication;
import com.foodrescue.auth.dto.AuthDtos.LoginRequest;
import com.foodrescue.listing.dto.ListingDtos.CreateListingRequest;
import com.foodrescue.listing.dto.ListingDtos.UpdateListingRequest;
import com.foodrescue.listing.entity.DietType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = FoodRescueApplication.class)
@AutoConfigureMockMvc
public class ListingCrudTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String donorToken;
    private String ngoToken;

    @BeforeEach
    void setUp() throws Exception {
        // Authenticate donor
        LoginRequest donorLogin = new LoginRequest();
        donorLogin.setEmail("chef@saffronspice.com");
        donorLogin.setPassword("password123");

        MvcResult donorRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(donorLogin)))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> donorMap = objectMapper.readValue(donorRes.getResponse().getContentAsString(), Map.class);
        donorToken = (String) donorMap.get("accessToken");

        // Authenticate verified NGO
        LoginRequest ngoLogin = new LoginRequest();
        ngoLogin.setEmail("director@ashatrust.org");
        ngoLogin.setPassword("password123");

        MvcResult ngoRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ngoLogin)))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> ngoMap = objectMapper.readValue(ngoRes.getResponse().getContentAsString(), Map.class);
        ngoToken = (String) ngoMap.get("accessToken");
    }

    @Test
    @DisplayName("Test complete Listing CRUD: Create, Read, Update, and Delete/Cancel")
    void testListingLifecycleCrud() throws Exception {
        Instant now = Instant.now();
        Instant prep = now.minus(30, ChronoUnit.MINUTES);
        Instant expiry = now.plus(180, ChronoUnit.MINUTES);
        Instant pickupFrom = now;
        Instant pickupTo = now.plus(120, ChronoUnit.MINUTES);

        // 1. CREATE Listing
        CreateListingRequest createReq = new CreateListingRequest();
        createReq.setTitle("50 Gourmet Khichdi Bowls & Papad");
        createReq.setCategory("Cooked Meals");
        createReq.setDietType(DietType.VEG);
        createReq.setQuantity(50);
        createReq.setUnit("portions");
        createReq.setWeightKg(17.5);
        createReq.setPackaging("Eco-friendly biodegradable containers");
        createReq.setPreparedAt(prep);
        createReq.setBestBefore(expiry);
        createReq.setPickupFrom(pickupFrom);
        createReq.setPickupTo(pickupTo);
        createReq.setAddressLine("Connaught Place Block A");
        createReq.setCity("New Delhi");
        createReq.setLatitude(28.632);
        createReq.setLongitude(77.218);
        createReq.setAllergens("None");
        createReq.setNotes("Hot and fresh");
        createReq.setSafetyAck(true);

        MvcResult createRes = mockMvc.perform(post("/api/v1/listings")
                        .header("Authorization", "Bearer " + donorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("50 Gourmet Khichdi Bowls & Papad"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andReturn();

        Map<?, ?> resMap = objectMapper.readValue(createRes.getResponse().getContentAsString(), Map.class);
        Number listingId = (Number) resMap.get("id");

        // 2. READ Listing by ID
        mockMvc.perform(get("/api/v1/listings/" + listingId)
                        .header("Authorization", "Bearer " + donorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(listingId.intValue()))
                .andExpect(jsonPath("$.quantity").value(50));

        // 3. READ Discovery / Nearby
        mockMvc.perform(get("/api/v1/listings/nearby")
                        .param("lat", "28.632")
                        .param("lng", "77.218")
                        .param("radiusKm", "10.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // 4. UPDATE Listing
        UpdateListingRequest updateReq = new UpdateListingRequest();
        updateReq.setTitle("55 Gourmet Khichdi Bowls & Papad (Updated)");
        updateReq.setQuantity(55);
        updateReq.setNotes("Extra hot, included lemon pickle sachets");

        mockMvc.perform(put("/api/v1/listings/" + listingId)
                        .header("Authorization", "Bearer " + donorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("55 Gourmet Khichdi Bowls & Papad (Updated)"))
                .andExpect(jsonPath("$.quantity").value(55))
                .andExpect(jsonPath("$.notes").value("Extra hot, included lemon pickle sachets"));

        // 5. Unauthorized User cannot update listing
        mockMvc.perform(put("/api/v1/listings/" + listingId)
                        .header("Authorization", "Bearer " + ngoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isForbidden());

        // 6. DELETE / CANCEL Listing
        mockMvc.perform(delete("/api/v1/listings/" + listingId)
                        .header("Authorization", "Bearer " + donorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        // 7. Verify Status is CANCELLED
        mockMvc.perform(get("/api/v1/listings/" + listingId)
                        .header("Authorization", "Bearer " + donorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}
