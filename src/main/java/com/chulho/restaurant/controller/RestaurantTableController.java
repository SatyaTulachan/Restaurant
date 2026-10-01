package com.chulho.restaurant.controller;

import com.chulho.restaurant.entity.RestaurantTable;
import com.chulho.restaurant.entity.TableStatus;
import com.chulho.restaurant.service.RestaurantTableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class RestaurantTableController {

    private final RestaurantTableService tableService;

    @GetMapping
    public List<RestaurantTable> getAll() {
        return tableService.getAll();
    }

    @GetMapping("/{id}")
    public RestaurantTable getById(@PathVariable Long id) {
        return tableService.getById(id);
    }

    @PostMapping
    public ResponseEntity<RestaurantTable> create(@Valid @RequestBody RestaurantTable table) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tableService.create(table));
    }

    @PutMapping("/{id}")
    public RestaurantTable update(@PathVariable Long id,@Valid @RequestBody RestaurantTable table) {
        return tableService.update(id, table);
    }

    @PatchMapping("/{id}/status")
    public RestaurantTable updateStatus(@PathVariable Long id, @RequestParam TableStatus status) {
        return tableService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tableService.delete(id);
        return ResponseEntity.noContent().build();
    }
}