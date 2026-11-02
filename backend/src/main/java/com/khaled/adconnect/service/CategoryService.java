package com.khaled.adconnect.service;

import com.khaled.adconnect.dto.CategoryRequest;
import com.khaled.adconnect.dto.CategoryResponse;
import com.khaled.adconnect.exception.ConflictException;
import com.khaled.adconnect.exception.ResourceNotFoundException;
import com.khaled.adconnect.model.Category;
import com.khaled.adconnect.repository.CategoryRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = findCategoryById(id);
        return toResponse(category);
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new ConflictException("Category with this name already exists.");
        }

        Category category = new Category();
        updateCategoryFromRequest(category, request);

        return toResponse(categoryRepository.save(category));
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findCategoryById(id);
        updateCategoryFromRequest(category, request);

        return toResponse(categoryRepository.save(category));
    }

    public void deleteCategory(Long id) {
        Category category = findCategoryById(id);
        categoryRepository.delete(category);
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category with id " + id + " was not found."));
    }

    private void updateCategoryFromRequest(Category category, CategoryRequest request) {
        category.setName(request.getName());
        category.setDescription(request.getDescription());
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription()
        );
    }
}
