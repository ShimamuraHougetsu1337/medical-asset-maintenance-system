package com.medical.system.dto;

import com.medical.system.model.enums.RequestStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ServiceRequestDto {
    private Long id;
    private Long assetId;
    private String assetName;
    private String reportedByUsername;
    private String description;
    private RequestStatus status;
    private List<ServiceLogDto> logs;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}

