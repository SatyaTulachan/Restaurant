package com.chulho.restaurant.service;

import com.chulho.restaurant.entity.RestaurantTable;
import com.chulho.restaurant.entity.TableStatus;
import com.chulho.restaurant.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.chulho.restaurant.exception.ResourceNotFoundException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantTableService {

    private final RestaurantTableRepository tableRepository;

    public List<RestaurantTable> getAll() {
        return tableRepository.findAll();
    }

    public RestaurantTable getById(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found: " + id));
    }

    public RestaurantTable create(RestaurantTable table) {
        if (table.getStatus() == null) {
            table.setStatus(TableStatus.AVAILABLE);
        }
        return tableRepository.save(table);
    }

    public RestaurantTable update(Long id, RestaurantTable updated) {
        RestaurantTable existing = getById(id);
        existing.setTableNumber(updated.getTableNumber());
        existing.setCapacity(updated.getCapacity());
        return tableRepository.save(existing);
    }

    public RestaurantTable updateStatus(Long id, TableStatus status) {
        RestaurantTable existing = getById(id);
        existing.setStatus(status);
        return tableRepository.save(existing);
    }

    public void delete(Long id) {
        getById(id);
        tableRepository.deleteById(id);
    }
}