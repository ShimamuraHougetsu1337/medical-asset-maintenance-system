package com.medical.system.repository;

import com.medical.system.model.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    /**
     * Trả về danh sách linh kiện có tồn kho nhỏ hơn hoặc bằng ngưỡng cảnh báo.
     */
    List<Inventory> findByQuantityLessThanEqual(int threshold);

    boolean existsByPartName(String partName);

    Optional<Inventory> findByPartName(String partName);
}

