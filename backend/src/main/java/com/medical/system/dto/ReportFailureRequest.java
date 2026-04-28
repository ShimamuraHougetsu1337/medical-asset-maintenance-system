package com.medical.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReportFailureRequest {
    @NotBlank(message = "Description is required")
    private String description;
}
