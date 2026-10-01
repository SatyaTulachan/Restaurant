package com.chulho.restaurant.service;

import com.chulho.restaurant.entity.Category;
import com.chulho.restaurant.entity.MenuItem;
import com.chulho.restaurant.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.chulho.restaurant.exception.ResourceNotFoundException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryService categoryService;

    public List<MenuItem> getAll() {
        return menuItemRepository.findAll();
    }

    public List<MenuItem> getByCategory(Long categoryId) {
        return menuItemRepository.findByCategoryId(categoryId);
    }

    public MenuItem getById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + id));
    }

    public MenuItem create(MenuItem item, Long categoryId) {
        Category category = categoryService.getById(categoryId);
        item.setCategory(category);
        if (item.getAvailable() == null) {
            item.setAvailable(true);
        }
        return menuItemRepository.save(item);
    }

    public MenuItem update(Long id, MenuItem updated, Long categoryId) {
        MenuItem existing = getById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setAvailable(updated.getAvailable());
        if (categoryId != null) {
            existing.setCategory(categoryService.getById(categoryId));
        }
        return menuItemRepository.save(existing);
    }

    public void delete(Long id) {
        getById(id);
        menuItemRepository.deleteById(id);
    }
}