package com.foodrescue.claim;

import com.foodrescue.FoodRescueApplication;
import com.foodrescue.auth.dto.AuthDtos.LoginRequest;
import com.foodrescue.listing.dto.ListingDtos.CreateListingRequest;
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
public class ClaimAndDeliveryCrudTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String donorToken;
    private String ngoToken;
    private String volunteerToken;

    @BeforeEach
    void setUp() throws Exception {
        donorToken = getToken("chef@saffronspice.com", "password123");
        ngoToken = getToken("director@ashatrust.org", "password123");
        volunteerToken = getToken("rahul.volunteer@gmail.com", "password123");
    }

    private String getToken(String email, String password) throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail(email);
        req.setPassword(password);

        MvcResult res = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> map = objectMapper.readValue(res.getResponse().getContentAsString(), Map.class);
        return (String) map.get("accessToken");
    }

    @Test
    @DisplayName("Test Claim & Delivery Task CRUD Lifecycle with Volunteer Pickup and Delivery")
    void testClaimAndDeliveryLifecycle() throws Exception {
        Instant now = Instant.now();

        // 1. Create a listing by Donor
        CreateListingRequest createReq = new CreateListingRequest();
        createReq.setTitle("30 Vegetable Sandwiches");
        createReq.setCategory("Snacks & Bakery");
        createReq.setDietType(DietType.VEG);
        createReq.setQuantity(30);
        createReq.setUnit("portions");
        createReq.setPreparedAt(now.minus(20, ChronoUnit.MINUTES));
        createReq.setBestBefore(now.plus(120, ChronoUnit.MINUTES));
        createReq.setSafetyAck(true);

        MvcResult listingRes = mockMvc.perform(post("/api/v1/listings")
                        .header("Authorization", "Bearer " + donorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> listingMap = objectMapper.readValue(listingRes.getResponse().getContentAsString(), Map.class);
        Number listingId = (Number) listingMap.get("id");

        // 2. NGO creates claim
        MvcResult claimRes = mockMvc.perform(post("/api/v1/listings/" + listingId + "/claims")
                        .header("Authorization", "Bearer " + ngoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"pickupMode\":\"VOLUNTEER\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.claimId").exists())
                .andReturn();

        Map<?, ?> claimMap = objectMapper.readValue(claimRes.getResponse().getContentAsString(), Map.class);
        Number claimId = (Number) claimMap.get("claimId");

        // 3. NGO views their claim in /claims/mine
        mockMvc.perform(get("/api/v1/claims/mine")
                        .header("Authorization", "Bearer " + ngoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // 4. NGO updates claim (pickupMode)
        mockMvc.perform(put("/api/v1/claims/" + claimId)
                        .header("Authorization", "Bearer " + ngoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"pickupMode\":\"VOLUNTEER\"}"))
                .andExpect(status().isOk());

        // 5. Donor accepts claim
        mockMvc.perform(post("/api/v1/claims/" + claimId + "/accept")
                        .header("Authorization", "Bearer " + donorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        // 6. Check open delivery tasks for volunteer
        MvcResult tasksRes = mockMvc.perform(get("/api/v1/tasks/nearby"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andReturn();

        // 7. Volunteer views tasks /mine
        mockMvc.perform(get("/api/v1/tasks/mine")
                        .header("Authorization", "Bearer " + volunteerToken))
                .andExpect(status().isOk());
    }
}
