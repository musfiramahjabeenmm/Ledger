package com.example.backend.Category.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import com.example.backend.Category.Model.Category;
import com.example.backend.Category.enums.CategoryStatus;
import com.example.backend.Category.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category,Long>
{
     List<Category> findByUserId(UUID userId);

     @Query("SELECT COALESCE(SUM(c.budget), 0) FROM Category c WHERE c.userId = :userId AND c.categoryType = 'EXPENSE'")
    Long sumExpenseBudgetsByUserId(@Param("userId") UUID userId);

}
