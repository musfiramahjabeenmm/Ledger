package com.example.backend.Auth.Util;
import com.example.backend.Auth.Service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AuthContext {

    private final JwtService jwtService;

    // ───────── OPTIONAL USER ─────────
    public UUID getCurrentUserId(HttpServletRequest request) {
        String token = extractToken(request);

        if (token == null) {
            return null;
        }

        if (!jwtService.isTokenValid(token)) {
            return null;
        }

        return jwtService.extractUserId(token);
    }

    // ───────── REQUIRED USER ─────────
    public UUID requireCurrentUserId(HttpServletRequest request) {
        String token = extractToken(request);

        if (token == null) {
            throw new RuntimeException("Missing Authorization header");
        }

        if (!jwtService.isTokenValid(token)) {
            throw new RuntimeException("Invalid or expired token");
        }

        return jwtService.extractUserId(token);
    }

    // ───────── TOKEN EXTRACTOR ─────────
    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        return authHeader.substring(7);
    }
}