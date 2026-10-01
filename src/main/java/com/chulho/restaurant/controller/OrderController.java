package com.chulho.restaurant.controller;

import com.chulho.restaurant.dto.CreateOrderRequest;
import com.chulho.restaurant.entity.Order;
import com.chulho.restaurant.entity.OrderStatus;
import com.chulho.restaurant.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public List<Order> getAll() {
        return orderService.getAll();
    }

    @GetMapping("/{id}")
    public Order getById(@PathVariable Long id) {
        return orderService.getById(id);
    }

    @PostMapping
    public ResponseEntity<Order> create(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
    }

    @PatchMapping("/{id}/status")
    public Order updateStatus(@PathVariable Long id,@Valid @RequestParam OrderStatus status) {
        return orderService.updateStatus(id, status);
    }
}