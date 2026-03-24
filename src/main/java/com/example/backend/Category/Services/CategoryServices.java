package com.example.backend.Category.Services;

import com.example.backend.Auth.Service.JwtService;
import com.example.backend.Category.DTO.CategoryRequestDTO;
import com.example.backend.Category.DTO.CategoryResponseDTO;
import com.example.backend.Category.Model.Category;
import com.example.backend.Category.Repository.CategoryRepository;
import com.example.backend.Category.enums.CategoryStatus;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServices {

    private final CategoryRepository categoryRepository;
    private final HttpServletRequest httpRequest;
    private final JwtService jwtService;

    private UUID getCurrentUserId() {
        String token = httpRequest.getHeader("Authorization").substring(7);
        return jwtService.extractUserId(token);
    }

    public CategoryResponseDTO createCategory(CategoryRequestDTO requestDTO) {
        UUID userId = getCurrentUserId();

        Category category = new Category();
        category.setUserId(userId);
        category.setCategoryName(requestDTO.getCategoryName());
        category.setCategoryType(requestDTO.getCategoryType());
        category.setCategoryStatus(CategoryStatus.ACTIVE);

        Category savedCategory = categoryRepository.save(category);
        return mapToResponse(savedCategory);
    }

    public List<CategoryResponseDTO> getAllCategories() {
        UUID userId = getCurrentUserId();
        return categoryRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponseDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return mapToResponse(category);
    }

    public CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO requestDTO) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setCategoryName(requestDTO.getCategoryName());
        category.setCategoryType(requestDTO.getCategoryType());
        Category updatedCategory = categoryRepository.save(category);
        return mapToResponse(updatedCategory);
    }

    public String deactivateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setCategoryStatus(CategoryStatus.INACTIVE);
        categoryRepository.save(category);
        return "Category deactivated successfully";
    }

    public String activateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setCategoryStatus(CategoryStatus.ACTIVE);
        categoryRepository.save(category);
        return "Category activated successfully";
    }

    private CategoryResponseDTO mapToResponse(Category category) {
        CategoryResponseDTO responseDTO = new CategoryResponseDTO();
        responseDTO.setCategoryId(category.getCategoryId());
        responseDTO.setCategoryName(category.getCategoryName());
        responseDTO.setCategoryStatus(category.getCategoryStatus());
        responseDTO.setCategoryType(category.getCategoryType());
        responseDTO.setCreatedAt(category.getCreatedAt());
        responseDTO.setUpdatedAt(category.getUpdatedAt());
        return responseDTO;
    }
}