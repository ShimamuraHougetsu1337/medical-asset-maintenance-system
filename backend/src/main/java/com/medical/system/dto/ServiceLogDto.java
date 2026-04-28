package com.medical.system.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ServiceLogDto {
    private Long id;
    private String engineerUsername;
    private String resolutionDetails;
    private List<ServiceLogPartDto> usedParts;
    private String additionalLogData;
    private LocalDateTime createdAt;
}
