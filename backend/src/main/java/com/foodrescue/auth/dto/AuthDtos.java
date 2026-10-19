package com.foodrescue.auth.dto;

import com.foodrescue.user.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Phone number is required")
        private String phone;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @NotNull(message = "Role is required")
        private Role role;

        private String addressLine;
        private String city;
        private String darpanRegNo;
        private String fssaiLicense;
        private String adminSecret;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
        public String getAddressLine() { return addressLine; }
        public void setAddressLine(String addressLine) { this.addressLine = addressLine; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getDarpanRegNo() { return darpanRegNo; }
        public void setDarpanRegNo(String darpanRegNo) { this.darpanRegNo = darpanRegNo; }
        public String getFssaiLicense() { return fssaiLicense; }
        public void setFssaiLicense(String fssaiLicense) { this.fssaiLicense = fssaiLicense; }
        public String getAdminSecret() { return adminSecret; }
        public void setAdminSecret(String adminSecret) { this.adminSecret = adminSecret; }
    }

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class OtpVerifyRequest {
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "OTP is required")
        @Size(min = 6, max = 6, message = "OTP must be exactly 6 digits")
        private String otp;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
    }

    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private Long userId;
        private String name;
        private String email;
        private Role role;
        private boolean verified;

        public AuthResponse(String accessToken, String refreshToken, Long userId, String name, String email, Role role, boolean verified) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.userId = userId;
            this.name = name;
            this.email = email;
            this.role = role;
            this.verified = verified;
        }

        public String getAccessToken() { return accessToken; }
        public String getRefreshToken() { return refreshToken; }
        public String getTokenType() { return tokenType; }
        public Long getUserId() { return userId; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public Role getRole() { return role; }
        public boolean isVerified() { return verified; }
    }

    public static class GoogleAuthRequest {
        private String idToken;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String name;
        private Role role; // Optional, defaults to DONOR if new user
        private String picture;
        private String city;
        private String phone;
        private String adminSecret;

        public String getIdToken() { return idToken; }
        public void setIdToken(String idToken) { this.idToken = idToken; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
        public String getPicture() { return picture; }
        public void setPicture(String picture) { this.picture = picture; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getAdminSecret() { return adminSecret; }
        public void setAdminSecret(String adminSecret) { this.adminSecret = adminSecret; }
    }
}
