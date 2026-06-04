package com.medical.system.repository;

import com.medical.system.AbstractIntegrationTest;
import com.medical.system.model.entity.Asset;
import com.medical.system.model.entity.ServiceRequest;
import com.medical.system.model.entity.User;
import com.medical.system.model.enums.AssetStatus;
import com.medical.system.model.enums.RequestStatus;
import com.medical.system.repository.AssetRepository;
import com.medical.system.repository.ServiceRequestRepository;
import com.medical.system.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@Transactional
class ServiceRequestRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByAssetIdAndStatusInOrderByCreatedAtDesc_shouldReturnMatchedRequests() {
        // Arrange
        User user = new User();
        user.setUsername("doctor_test");
        user.setPassword("pass");
        user.setRole(com.medical.system.model.enums.Role.DOCTOR);
        user = userRepository.save(user);

        Asset asset = Asset.builder()
                .code("CT-001")
                .name("CT Scanner")
                .status(AssetStatus.AVAILABLE)
                .build();
        asset = assetRepository.save(asset);

        ServiceRequest pendingReq = ServiceRequest.builder()
                .asset(asset)
                .reportedBy(user)
                .status(RequestStatus.PENDING)
                .description("Pending issue")
                .build();
        
        ServiceRequest completedReq = ServiceRequest.builder()
                .asset(asset)
                .reportedBy(user)
                .status(RequestStatus.COMPLETED)
                .description("Completed issue")
                .build();

        serviceRequestRepository.save(pendingReq);
        serviceRequestRepository.save(completedReq);

        // Act
        List<ServiceRequest> results = serviceRequestRepository.findByAssetIdAndStatusInOrderByCreatedAtDesc(
                asset.getId(), List.of(RequestStatus.PENDING));

        // Assert
        assertEquals(1, results.size());
        assertEquals(RequestStatus.PENDING, results.get(0).getStatus());
        assertEquals("Pending issue", results.get(0).getDescription());
    }
}
