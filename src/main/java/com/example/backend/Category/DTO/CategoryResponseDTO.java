package com.example.backend.Category.DTO;

import com.example.backend.Category.enums.CategoryStatus;
import com.example.backend.Category.enums.CategoryType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CategoryResponseDTO {
    private Long categoryId;
    private String categoryName;
    private CategoryStatus categoryStatus;
    private CategoryType categoryType;
    private Long budget;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
