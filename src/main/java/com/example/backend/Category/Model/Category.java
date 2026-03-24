package com.example.backend.Category.Model;

import com.example.backend.Category.enums.CategoryStatus;
import com.example.backend.Category.enums.CategoryType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "category", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "categoryName"})
})
@Getter
@Setter
public class Category
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long categoryId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String categoryName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoryType categoryType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoryStatus categoryStatus;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Column(nullable = true)
    private Long budget = 0L;

    @PrePersist
    protected void onCreated()
    {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate()
    {
        this.updatedAt = LocalDateTime.now();
    }
}