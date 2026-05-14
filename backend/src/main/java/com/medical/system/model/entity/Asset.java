package com.medical.system.model.entity;

import com.medical.system.model.enums.AssetStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetStatus status;

    /**
     * Ngày đến hạn bảo trì tiếp theo. Cron Job sẽ quét field này hàng ngày.
     */
    @Column(name = "next_maintenance_date")
    private LocalDate nextMaintenanceDate;
}
