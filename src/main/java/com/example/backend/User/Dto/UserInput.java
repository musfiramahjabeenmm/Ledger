package com.example.backend.User.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserInput {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email
    private String email;

    // OPTIONAL phone (for Google users)
    @Pattern(
        regexp = "^[6-9][0-9]{9}$",
        message = "Invalid Mobile number"
    )
    private String phone;

    // OPTIONAL password (Google users won’t have this)
    private String password;

    // Optional during onboarding
    private Long monthlyIncome;
}