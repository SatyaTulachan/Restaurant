package com.chulho.restaurant.service;

import com.chulho.restaurant.dto.CreateOrderRequest;
import com.chulho.restaurant.dto.OrderItemRequest;
import com.chulho.restaurant.entity.*;
import com.chulho.restaurant.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.chulho.restaurant.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestaurantTableService tableService;
    private final MenuItemService menuItemService;

    public List<Order> getAll() {
        return orderRepository.findAll();
    }

    public Order getById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        RestaurantTable table = tableService.getById(request.getTableId());

        Order order = new Order();
        order.setTable(table);
        order.setStatus(OrderStatus.PENDING);

        for (OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemService.getById(itemReq.getMenuItemId());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPrice(menuItem.getPrice());

            order.getItems().add(orderItem);
        }

        recalculateTotal(order);
        Order savedOrder = orderRepository.save(order);

        tableService.updateStatus(table.getId(), TableStatus.OCCUPIED);

        return savedOrder;
    }

    @Transactional
    public Order updateStatus(Long orderId, OrderStatus status) {
        Order order = getById(orderId);
        order.setStatus(status);

        if (status == OrderStatus.PAID) {
            tableService.updateStatus(order.getTable().getId(), TableStatus.AVAILABLE);
        }

        return orderRepository.save(order);
    }

    private void recalculateTotal(Order order) {
        BigDecimal total = order.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(total);
    }
}