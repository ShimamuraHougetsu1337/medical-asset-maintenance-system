package com.medical.system.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medical.system.AbstractIntegrationTest;
import com.medical.system.dto.asset.AssetDto;
import com.medical.system.model.entity.Asset;
import com.medical.system.model.enums.AssetStatus;
import com.medical.system.repository.AssetRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@Transactional
class AssetControllerTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getAllAssets_shouldReturnAssets() throws Exception {
        // Arrange
        Asset asset = Asset.builder()
                .code("TEST-001")
                .name("Test Asset")
                .status(AssetStatus.AVAILABLE)
                .build();
        assetRepository.save(asset);

        // Act & Assert
        mockMvc.perform(get("/api/assets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data[0].code").value("TEST-001"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void createAsset_shouldReturnCreatedAsset() throws Exception {
        // Arrange
        AssetDto assetDto = AssetDto.builder()
                .code("NEW-002")
                .name("New Machine")
                .status(AssetStatus.AVAILABLE)
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/assets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assetDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.code").value("NEW-002"))
                .andExpect(jsonPath("$.data.name").value("New Machine"));
    }

    @Test
    void createAsset_withoutAuth_shouldReturn401() throws Exception {
        // Arrange
        AssetDto assetDto = AssetDto.builder()
                .code("FAIL-001")
                .name("Fail Machine")
                .build();

        // Act & Assert
        // Không có @WithMockUser, giả lập request từ người dùng chưa đăng nhập
        mockMvc.perform(post("/api/assets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assetDto)))
                .andExpect(status().isUnauthorized());
    }
}
