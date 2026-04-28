package com.medical.system.config;

import com.medical.system.model.entity.Asset;
import com.medical.system.model.entity.Inventory;
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


import java.util.List;

/**
 * Seeds the database with initial data for testing.
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
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Cleaning up database before seeding...");
        
        // Delete in correct order using batch delete for efficiency and to avoid FK issues
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
        
        log.info("Database seeding completed successfully. System is ready for a fresh flow test.");
    }

    private void seedUsers() {
        createDefaultUser("admin", "admin123", Role.ADMIN);
        createDefaultUser("doctor", "doctor123", Role.DOCTOR);
        createDefaultUser("engineer", "engineer123", Role.ENGINEER);
    }

    private void seedAssets() {
        List<Asset> assets = List.of(
                Asset.builder().code("AST001").name("MRI Scanner - Siemens").status(AssetStatus.AVAILABLE).build(),
                Asset.builder().code("AST002").name("Ventilator - Drager").status(AssetStatus.AVAILABLE).build(),
                Asset.builder().code("AST003").name("Ultrasound - GE").status(AssetStatus.AVAILABLE).build(),
                Asset.builder().code("AST004").name("X-Ray Machine - Philips").status(AssetStatus.AVAILABLE).build(),
                Asset.builder().code("AST005").name("Patient Monitor - Mindray").status(AssetStatus.AVAILABLE).build(),
                Asset.builder().code("AST006").name("Infusion Pump - Baxter").status(AssetStatus.AVAILABLE).build()
        );
        assetRepository.saveAll(assets);
        log.info("Seeded 6 assets in AVAILABLE status");
    }


    private void seedInventory() {
        List<Inventory> inventoryList = List.of(
                Inventory.builder().partName("LCD Display Panel").quantity(10).build(),
                Inventory.builder().partName("Power Supply Unit").quantity(5).build(),
                Inventory.builder().partName("Oxygen Sensor").quantity(50).build(),
                Inventory.builder().partName("Thermal Printer Paper").quantity(100).build()
        );
        inventoryRepository.saveAll(inventoryList);
        log.info("Seeded inventory data");
    }

    private void createDefaultUser(String username, String password, Role role) {
        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .role(role)
                .build();
        userRepository.save(user);
        log.info("Created user: {}", username);
    }
}


