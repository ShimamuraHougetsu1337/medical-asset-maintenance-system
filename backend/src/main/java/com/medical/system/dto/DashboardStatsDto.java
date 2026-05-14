package com.medical.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO trả về thống kê tổng hợp cho trang Dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private AssetStatisticsDto assetStats;
    private java.util.List<LowStockAlertDto> lowStockAlerts;
}
