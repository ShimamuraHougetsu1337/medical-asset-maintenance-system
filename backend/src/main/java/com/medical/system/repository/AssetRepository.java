package com.medical.system.repository;

import com.medical.system.model.entity.Asset;
import com.medical.system.model.enums.AssetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    /**
     * Dùng bởi Cron Job để tìm các Asset đến hạn bảo trì.
     */
    List<Asset> findByNextMaintenanceDateLessThanEqual(LocalDate date);

    /**
     * Dùng bởi API thống kê để đếm thiết bị theo trạng thái.
     */
    long countByStatus(AssetStatus status);
}

