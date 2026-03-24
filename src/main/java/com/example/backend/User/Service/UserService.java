package com.example.backend.User.Service;

import java.util.List;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.example.backend.User.Model.UserDB;
import com.example.backend.User.Repository.UserRepository;
import com.example.backend.User.Dto.UserInput;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDB addCustomer(UserInput dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        UserDB user = new UserDB();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setPassword(dto.getPassword()); // IMPORTANT
        user.setMonthlyIncome(0L); // safe default

        return userRepository.save(user);
    }

    public UserDB getCustomer(UUID id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<UserDB> allCustomers() {
        return userRepository.findAll();
    }

    public UserDB updateCustomer(UUID id, UserInput dto) {
        UserDB user = userRepository.findById(id).orElse(null);
        if (user == null)
            return null;

        if (!user.getEmail().equals(dto.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        return userRepository.save(user);
    }

    // ── NEW METHOD FOR INCOME ──
    public void updateIncome(UUID userId, Long income) {
        if (income == null || income < 0) {
            throw new RuntimeException("Invalid income value");
        }
        UserDB user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setMonthlyIncome(income);
        userRepository.save(user);
    }
}