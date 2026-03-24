package com.example.backend.Category.DTO;

import com.example.backend.Category.enums.CategoryStatus;
import com.example.backend.Category.enums.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequestDTO
{
    @NotBlank
    private String categoryName;

    @NotNull
    private CategoryType categoryType;

}
