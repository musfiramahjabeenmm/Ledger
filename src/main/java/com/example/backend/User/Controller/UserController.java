package com.example.backend.User.Controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.User.Dto.UserInput;
import com.example.backend.User.Model.UserDB;
import com.example.backend.User.Service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ───── CREATE USER ─────
    @PostMapping
    public ResponseEntity<UserDB> addUser(@Valid @RequestBody UserInput userInput) {
        UserDB user = userService.addCustomer(userInput);
        return ResponseEntity.ok(user);
    }

    // ───── GET USER BY ID ─────
    @GetMapping("/{id}")
    public ResponseEntity<UserDB> getUser(@PathVariable UUID id) {
        UserDB user = userService.getCustomer(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    // ───── GET ALL USERS ─────
    @GetMapping
    public ResponseEntity<List<UserDB>> allUsers() {
        return ResponseEntity.ok(userService.allCustomers());
    }

    // ───── UPDATE USER DETAILS ─────
    @PutMapping("/{id}")
    public ResponseEntity<UserDB> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserInput userInput) {

        UserDB user = userService.updateCustomer(id, userInput);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    // ───── UPDATE USER INCOME ─────
    @PutMapping("/{id}/income")
    public ResponseEntity<?> updateIncome(
            @PathVariable UUID id,
            @RequestBody Map<String, Long> body) {

        Long income = body.get("income");

        if (income == null) {
            return ResponseEntity.badRequest().body("Income is required");
        }

        userService.updateIncome(id, income);

        return ResponseEntity.ok("Income updated successfully");
    }
}