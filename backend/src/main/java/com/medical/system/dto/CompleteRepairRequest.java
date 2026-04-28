package com.medical.system.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CompleteRepairRequest {

    @NotBlank(message = "Resolution details cannot be blank")
    private String resolutionDetails;

    @Valid
    private List<UsedPartDto> usedParts;
}
