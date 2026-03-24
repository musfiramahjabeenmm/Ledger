package com.example.backend.Auth.Service;

import com.example.backend.Auth.Dto.AuthResponse;
import com.example.backend.Auth.Dto.GoogleAuthRequest;
import com.example.backend.Auth.Dto.LoginRequest;
import com.example.backend.Auth.Dto.RegisterRequest;
import com.example.backend.User.Model.UserDB;
import com.example.backend.User.Repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    // ───────────────── REGISTER ─────────────────
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        // ✅ phone optional check
        if (request.getPhone() != null &&
            userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new IllegalArgumentException("Phone number already registered: " + request.getPhone());
        }

        UserDB user = UserDB.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(hashPassword(request.getPassword()))
                .status(true)
                .monthlyIncome(0L) // ✅ prevent NULL crash
                .build();

        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .token(token)
                .message("Registration successful")
                .isOnboarded(false) // always false at start
                .build();
    }

    // ───────────────── LOGIN ─────────────────
    public AuthResponse login(LoginRequest request) {

        Optional<UserDB> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("User does not exist");
        }

        UserDB user = optionalUser.get();

        if (!verifyPassword(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        if (!user.getIsActive()) {
            throw new IllegalArgumentException("User account is inactive");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .token(token)
                .message("Login successful")
                .isOnboarded(user.getMonthlyIncome() != null && user.getMonthlyIncome() > 0)
                .build();
    }

    // ───────────────── GOOGLE AUTH ─────────────────
    public AuthResponse googleAuth(GoogleAuthRequest request) {

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory())
                    .setAudience(Collections.singletonList(
                        "268994410626-ib2d087j6ficqikdm9n79uul429hqh3c.apps.googleusercontent.com"))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(request.getToken());

            if (googleIdToken == null) {
                throw new IllegalArgumentException("Invalid Google token");
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();
            String email = payload.getEmail();
            String name  = (String) payload.get("name");

            String phonePlaceholder = "G_" + email.replace("@", "_").replace(".", "_");

            UserDB user = userRepository.findByEmail(email).orElseGet(() -> {
                UserDB newUser = UserDB.builder()
                        .name(name != null ? name : email)
                        .email(email)
                        .phone(phonePlaceholder)
                        .password("GOOGLE_USER") // ✅ better than empty
                        .monthlyIncome(0L)       // ✅ prevent crash
                        .status(true)
                        .build();

                return userRepository.save(newUser);
            });

            String token = jwtService.generateToken(user.getId(), user.getEmail());

            return AuthResponse.builder()
                    .userId(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .token(token)
                    .message("Google login successful")
                    .isOnboarded(user.getMonthlyIncome() != null && user.getMonthlyIncome() > 0)
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            throw new IllegalArgumentException("Google authentication failed: " + e.getMessage());
        }
    }

    // ───────────────── PASSWORD UTILS ─────────────────
    private String hashPassword(String password) {
        return Integer.toHexString(password.hashCode());
    }

    private boolean verifyPassword(String rawPassword, String hashedPassword) {
        return hashPassword(rawPassword).equals(hashedPassword);
    }
}
