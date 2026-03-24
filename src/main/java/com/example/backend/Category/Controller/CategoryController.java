package com.example.backend.Category.Controller;

import com.example.backend.Category.DTO.CategoryRequestDTO;
import com.example.backend.Category.DTO.CategoryResponseDTO;
import com.example.backend.Category.Services.CategoryServices;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryServices categoryServices;

    // ✅ CREATE CATEGORY
    @PostMapping
    public ResponseEntity<CategoryResponseDTO> createCategory(
            @RequestBody CategoryRequestDTO requestDTO) {

        CategoryResponseDTO response = categoryServices.createCategory(requestDTO);
        return ResponseEntity.ok(response);
    }

    // ✅ GET ALL CATEGORIES
    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        List<CategoryResponseDTO> categories = categoryServices.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    // ✅ GET CATEGORY BY ID
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> getCategoryById(
            @PathVariable Long id) {

        CategoryResponseDTO response = categoryServices.getCategoryById(id);
        return ResponseEntity.ok(response);
    }

    // ✅ UPDATE CATEGORY
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryRequestDTO requestDTO) {

        CategoryResponseDTO response = categoryServices.updateCategory(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    // ✅ DEACTIVATE CATEGORY (Soft Delete)
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<String> deactivateCategory(@PathVariable Long id) {

        String message = categoryServices.deactivateCategory(id);
        return ResponseEntity.ok(message);
    }

    // ✅ ACTIVATE CATEGORY
    @PutMapping("/{id}/activate")
    public ResponseEntity<String> activateCategory(@PathVariable Long id) {

        String message = categoryServices.activateCategory(id);
        return ResponseEntity.ok(message);
    }
}