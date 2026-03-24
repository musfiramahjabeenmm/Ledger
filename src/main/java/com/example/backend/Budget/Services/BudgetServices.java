package com.example.backend.Budget.Services;

import com.example.backend.Auth.Service.JwtService;
import com.example.backend.Budget.DTO.BudgetRequest;
import com.example.backend.Budget.DTO.BudgetResponse;
import com.example.backend.Budget.Model.Budget;
import com.example.backend.Budget.Repository.BudgetRepository;
import com.example.backend.Category.Model.Category;
import com.example.backend.Category.Repository.CategoryRepository;
import com.example.backend.User.Model.UserDB;
import com.example.backend.User.Repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetServices {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final HttpServletRequest httpRequest;
    private final JwtService jwtService;

    /* ── Extract userId from JWT ── */
    private UUID getCurrentUserId() {
        String token = httpRequest.getHeader("Authorization").substring(7);
        return jwtService.extractUserId(token);
    }

    /* ── CREATE BUDGET ── */
    public BudgetResponse createBudget(BudgetRequest request) {
        UserDB user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        /* ── Validate: total existing budgets + new amount ≤ monthly income ── */
        if (user.getMonthlyIncome() != null && user.getMonthlyIncome() > 0) {
            Long totalExisting = budgetRepository.findByUserIdAndActiveTrue(request.getUserId())
                    .stream()
                    .mapToLong(Budget::getAmount)
                    .sum();

            if (totalExisting + request.getAmount() > user.getMonthlyIncome()) {
                long available = user.getMonthlyIncome() - totalExisting;
                throw new RuntimeException(
                        "Budget exceeds monthly income. You have ₹" + available + " available to allocate.");
            }
        }

        Budget budget = Budget.builder()
                .userId(request.getUserId())
                .amount(request.getAmount())
                .spentAmount(0L)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .description(request.getDescription())
                .active(true)
                .build();

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found: " + request.getCategoryId()));
            budget.setCategory(category);
        }

        return mapToResponse(budgetRepository.save(budget));
    }

    /* ── GET ALL — only current user's budgets ── */
    public List<BudgetResponse> getAllBudgets() {
        UUID userId = getCurrentUserId();
        return budgetRepository.findByUserId(userId)
                .stream()
                .map(b -> mapToResponse(b))
                .collect(Collectors.toList());
    }

    /* ── GET BY ID ── */
    public BudgetResponse getBudgetById(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        return mapToResponse(budget);
    }

    /* ── GET BY USER ── */
    public List<BudgetResponse> getBudgetsByUserId(UUID userId) {
        return budgetRepository.findByUserId(userId)
                .stream()
                .map(b -> mapToResponse(b))
                .collect(Collectors.toList());
    }

    public List<BudgetResponse> getActiveBudgetsByUserId(UUID userId) {
        return budgetRepository.findByUserIdAndActiveTrue(userId)
                .stream()
                .map(b -> mapToResponse(b))
                .collect(Collectors.toList());
    }

    /* ── UPDATE ── */
    public BudgetResponse updateBudget(Long id, BudgetRequest request) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        UserDB user = userRepository.findById(budget.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        /* ── Validate: total other budgets + updated amount ≤ income ── */
        if (user.getMonthlyIncome() != null && user.getMonthlyIncome() > 0) {
            Long totalOthers = budgetRepository.findByUserIdAndActiveTrue(budget.getUserId())
                    .stream()
                    .filter(b -> !b.getId().equals(id)) // exclude current budget
                    .mapToLong(Budget::getAmount)
                    .sum();

            if (totalOthers + request.getAmount() > user.getMonthlyIncome()) {
                long available = user.getMonthlyIncome() - totalOthers;
                throw new RuntimeException(
                        "Updated budget exceeds monthly income. You have ₹" + available + " available.");
            }
        }

        budget.setAmount(request.getAmount());
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());
        budget.setDescription(request.getDescription());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            budget.setCategory(category);
        }

        return mapToResponse(budgetRepository.save(budget));
    }

    /* ── ADD SPENDING ── */
    public BudgetResponse addSpending(Long id, Long amount) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        budget.setSpentAmount(budget.getSpentAmount() + amount);
        return mapToResponse(budgetRepository.save(budget));
    }

    /* ── DELETE ── */
    public void deleteBudget(Long id) {
        budgetRepository.deleteById(id);
    }

    /* ── DEACTIVATE ── */
    public String deactivateBudget(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        budget.setActive(false);
        budgetRepository.save(budget);
        return "Budget deactivated";
    }

    /* ── MAPPER ── */
    private BudgetResponse mapToResponse(Budget budget) {
        return BudgetResponse.builder()
                .id(budget.getId())
                .userId(budget.getUserId())
                .amount(budget.getAmount())
                .spentAmount(budget.getSpentAmount())
                .remainingAmount(budget.getRemainingAmount())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .categoryId(budget.getCategory() != null ? budget.getCategory().getCategoryId() : null)
                .categoryName(budget.getCategory() != null ? budget.getCategory().getCategoryName() : null)
                .description(budget.getDescription())
                .active(budget.getActive())
                .exceeded(budget.isExceeded())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }
}