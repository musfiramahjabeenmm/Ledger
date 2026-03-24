package com.example.backend.Auth.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private UUID userId;
    private String name;
    private String email;
    private String token;
    private String message;

    // ✅ IMPORTANT: for onboarding flow
    private boolean isOnboarded;
}