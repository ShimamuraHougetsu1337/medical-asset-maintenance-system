package com.medical.system.repository;

import com.medical.system.AbstractIntegrationTest;
import com.medical.system.model.entity.Asset;
import com.medical.system.model.enums.AssetStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@Transactional
class AssetRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    private AssetRepository assetRepository;

    @Test
    void findByCode_shouldReturnAsset_whenCodeExists() {
        // Arrange
        Asset asset = Asset.builder()
                .code("MRI-001")
                .name("MRI Scanner")
                .status(AssetStatus.AVAILABLE)
                .build();
        assetRepository.save(asset);

        // Act
        Optional<Asset> found = assetRepository.findByCode("MRI-001");

        // Assert
        assertTrue(found.isPresent());
        assertEquals("MRI Scanner", found.get().getName());
    }

    @Test
    void findByNextMaintenanceDateLessThanEqual_shouldReturnDueAssets() {
        // Arrange
        LocalDate today = LocalDate.now();
        Asset dueAsset = Asset.builder()
                .code("XRAY-001")
                .name("X-Ray")
                .status(AssetStatus.AVAILABLE)
                .nextMaintenanceDate(today.minusDays(1))
                .build();
        
        Asset futureAsset = Asset.builder()
                .code("XRAY-002")
                .name("X-Ray 2")
                .status(AssetStatus.AVAILABLE)
                .nextMaintenanceDate(today.plusDays(5))
                .build();

        assetRepository.save(dueAsset);
        assetRepository.save(futureAsset);

        // Act
        List<Asset> dueAssets = assetRepository.findByNextMaintenanceDateLessThanEqual(today);

        // Assert
        assertTrue(dueAssets.stream().anyMatch(a -> a.getCode().equals("XRAY-001")));
        assertFalse(dueAssets.stream().anyMatch(a -> a.getCode().equals("XRAY-002")));
    }

    @Test
    void countByStatus_shouldReturnCorrectCount() {
        // Arrange
        long initialBrokenCount = assetRepository.countByStatus(AssetStatus.BROKEN);

        Asset broken1 = Asset.builder().code("B-1").name("B1").status(AssetStatus.BROKEN).build();
        Asset broken2 = Asset.builder().code("B-2").name("B2").status(AssetStatus.BROKEN).build();
        assetRepository.save(broken1);
        assetRepository.save(broken2);

        // Act
        long finalBrokenCount = assetRepository.countByStatus(AssetStatus.BROKEN);

        // Assert
        assertEquals(initialBrokenCount + 2, finalBrokenCount);
    }
}
