package com.medical.system.controller;

import com.medical.system.dto.ApiResponse;
import com.medical.system.model.entity.Asset;
import com.medical.system.repository.AssetRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller for asset inventory management.
 */
@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
@Tag(name = "Asset Management", description = "Endpoints for managing medical assets")
public class AssetController {

    private final AssetRepository assetRepository;

    @Operation(summary = "Get all assets")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Asset>>> getAllAssets() {
        List<Asset> assets = assetRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(assets, "Assets retrieved successfully"));
    }
}
