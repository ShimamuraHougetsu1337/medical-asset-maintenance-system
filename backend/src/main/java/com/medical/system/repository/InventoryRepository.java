package com.medical.system.repository;

import com.medical.system.model.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    /**
     * Trả về danh sách linh kiện có tồn kho nhỏ hơn hoặc bằng ngưỡng cảnh báo.
     */
    @Query("SELECT i FROM Inventory i WHERE i.minQuantity IS NOT NULL AND i.quantity <= i.minQuantity")
    List<Inventory> findItemsWithLowStock();

    boolean existsByPartName(String partName);
}

