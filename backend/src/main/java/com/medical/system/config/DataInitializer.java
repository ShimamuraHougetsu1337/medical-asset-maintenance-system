package com.medical.system.config;

import com.medical.system.model.entity.Asset;
import com.medical.system.model.entity.Inventory;
import com.medical.system.model.entity.ServiceRequest;
import com.medical.system.model.entity.User;
import com.medical.system.model.enums.AssetStatus;
import com.medical.system.model.enums.RequestStatus;
import com.medical.system.model.enums.Role;
import com.medical.system.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Seeds the database with initial data for testing.
 * Runs on every startup to ensure a clean, predictable state.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final InventoryRepository inventoryRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final ServiceLogRepository serviceLogRepository;
    private final ServiceLogPartRepository serviceLogPartRepository;
    private final MaintenanceScheduleRepository maintenanceScheduleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Cleaning up database before seeding...");

        // Delete in correct order using batch delete for efficiency and to avoid FK issues
        maintenanceScheduleRepository.deleteAllInBatch();
        serviceLogPartRepository.deleteAllInBatch();
        serviceLogRepository.deleteAllInBatch();
        serviceRequestRepository.deleteAllInBatch();
        assetRepository.deleteAllInBatch();
        inventoryRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        // Ensure deletes are flushed to the database
        userRepository.flush();

        log.info("Seeding new initial data for a fresh start...");
        seedUsers();
        seedAssets();
        seedInventory();

        log.info("Database seeding completed. System ready for testing.");
    }

    private void seedUsers() {
        // Phase 3 - 5 roles
        createDefaultUser("admin",    "admin123",    Role.ADMIN);
        createDefaultUser("doctor",   "doctor123",   Role.DOCTOR);
        createDefaultUser("nurse",    "nurse123",    Role.NURSE);
        createDefaultUser("engineer", "engineer123", Role.ENGINEER);
        createDefaultUser("manager",  "manager123",  Role.MANAGER);
    }

    private void seedAssets() {
        List<Asset> assets = List.of(
                Asset.builder()
                        .code("AST001").name("MRI Scanner - Siemens")
                        .status(AssetStatus.MAINTENANCE_DUE)
                        .nextMaintenanceDate(LocalDate.now().minusDays(1))
                        .build(),
                Asset.builder()
                        .code("AST002").name("Ventilator - Drager")
                        .status(AssetStatus.UNDER_MAINTENANCE)
                        .nextMaintenanceDate(LocalDate.now().plusDays(90))
                        .build(),
                Asset.builder()
                        .code("AST003").name("Ultrasound - GE")
                        .status(AssetStatus.BROKEN)
                        .nextMaintenanceDate(LocalDate.now().plusDays(30))
                        .build(),
                Asset.builder()
                        .code("AST004").name("X-Ray Machine - Philips")
                        .status(AssetStatus.AVAILABLE)
                        .nextMaintenanceDate(LocalDate.now().plusDays(60))
                        .build()
        );
        assetRepository.saveAll(assets);
        log.info("Seeded assets with various statuses (MAINTENANCE_DUE, UNDER_MAINTENANCE, BROKEN)");
        
        seedServiceRequests();
    }

    private void seedServiceRequests() {
        Asset ventilator = assetRepository.findByCode("AST002").orElse(null);
        Asset ultrasound = assetRepository.findByCode("AST003").orElse(null);
        User doctor = userRepository.findByUsername("doctor").orElse(null);

        if (ventilator != null) {
            serviceRequestRepository.save(ServiceRequest.builder()
                    .asset(ventilator)
                    .description("Bảo trì định kỳ - Kỹ sư đang thực hiện")
                    .status(RequestStatus.ASSIGNED)
                    .reportedBy(doctor)
                    .build());
        }

        if (ultrasound != null) {
            serviceRequestRepository.save(ServiceRequest.builder()
                    .asset(ultrasound)
                    .description("Màn hình không lên nguồn")
                    .status(RequestStatus.PENDING)
                    .reportedBy(doctor)
                    .build());
        }
        log.info("Seeded service requests (1 PENDING, 1 ASSIGNED)");
    }

    private void seedInventory() {
        List<Inventory> inventoryList = List.of(
                Inventory.builder().partName("LCD Display Panel").quantity(10).build(),    // Tại ngưỡng cảnh báo
                Inventory.builder().partName("Power Supply Unit").quantity(5).build(),     // Dưới ngưỡng → cảnh báo
                Inventory.builder().partName("Oxygen Sensor").quantity(50).build(),        // Bình thường
                Inventory.builder().partName("Thermal Printer Paper").quantity(8).build(), // Dưới ngưỡng → cảnh báo
                Inventory.builder().partName("Hydraulic Tubing").quantity(25).build()      // Bình thường
        );
        inventoryRepository.saveAll(inventoryList);
        log.info("Seeded 5 inventory items (3 below/at low-stock threshold for alert testing)");
    }

    private void createDefaultUser(String username, String password, Role role) {
        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .role(role)
                .build();
        userRepository.save(user);
        log.info("Created user: {} ({})", username, role);
    }
}
