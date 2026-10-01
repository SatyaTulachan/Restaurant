package com.chulho.restaurant.controller;

import com.chulho.restaurant.entity.MenuItem;
import com.chulho.restaurant.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    @GetMapping
    public List<MenuItem> getAll(@RequestParam(required = false) Long categoryId) {
        if (categoryId != null) {
            return menuItemService.getByCategory(categoryId);
        }
        return menuItemService.getAll();
    }

    @GetMapping("/{id}")
    public MenuItem getById(@PathVariable Long id) {
        return menuItemService.getById(id);
    }

    @PostMapping
    public ResponseEntity<MenuItem> create(@Valid @RequestBody MenuItem item, @RequestParam Long categoryId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuItemService.create(item, categoryId));
    }

    @PutMapping("/{id}")
    public MenuItem update(@PathVariable Long id,@Valid @RequestBody MenuItem item,
                           @RequestParam(required = false) Long categoryId) {
        return menuItemService.update(id, item, categoryId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        menuItemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}