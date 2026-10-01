package com.chulho.restaurant.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter @Setter
public class CreateOrderRequest {
    private Long tableId;
    private List<OrderItemRequest> items;
}