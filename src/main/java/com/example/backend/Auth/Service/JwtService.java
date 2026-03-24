package com.example.backend.Auth.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration:86400000}") // 24 hours
    private long expirationTime;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    // ───────── GENERATE TOKEN ─────────
    public String generateToken(UUID userId, String email) {
        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey())
                .compact();
    }

    // ───────── EXTRACT USER ID ─────────
    public UUID extractUserId(String token) {
        Claims claims = extractAllClaims(cleanToken(token));
        return UUID.fromString(claims.getSubject());
    }

    // ───────── EXTRACT EMAIL ─────────
    public String extractEmail(String token) {
        Claims claims = extractAllClaims(cleanToken(token));
        return claims.get("email", String.class);
    }

    // ───────── VALIDATE TOKEN ─────────
    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(cleanToken(token));
            return !isTokenExpired(claims);
        } catch (Exception e) {
            return false;
        }
    }

    // ───────── INTERNAL METHODS ─────────
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isTokenExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }

    // ✅ IMPORTANT: handle "Bearer " prefix
    private String cleanToken(String token) {
        if (token == null) return null;
        if (token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return token;
    }
}