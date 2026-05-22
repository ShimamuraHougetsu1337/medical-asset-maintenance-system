package com.medical.system.config;

import com.medical.system.model.entity.Asset;
import com.medical.system.model.entity.Department;
import com.medical.system.model.entity.Inventory;
import com.medical.system.model.entity.User;
import com.medical.system.model.entity.ServiceRequest;
import com.medical.system.model.entity.MaintenanceSchedule;
import com.medical.system.model.enums.AssetStatus;
import com.medical.system.model.enums.Role;
import com.medical.system.model.enums.RequestPriority;
import com.medical.system.model.enums.RequestStatus;
import com.medical.system.repository.AssetRepository;
import com.medical.system.repository.DepartmentRepository;
import com.medical.system.repository.InventoryRepository;
import com.medical.system.repository.UserRepository;
import com.medical.system.repository.ServiceRequestRepository;
import com.medical.system.repository.MaintenanceScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DefaultDataBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final DepartmentRepository departmentRepository;
    private final InventoryRepository inventoryRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final MaintenanceScheduleRepository maintenanceScheduleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedUsersIfMissing();
        Map<String, Department> departments = seedDepartmentsIfMissing();
        seedAssetsIfMissing(departments);
        seedInventoryIfMissing();
        seedServiceRequestsIfMissing();
        seedMaintenanceSchedulesIfMissing();
    }

    private void seedUsersIfMissing() {
        createUserIfMissing("admin", "admin123", Role.ADMIN);
        createUserIfMissing("doctor", "doctor123", Role.DOCTOR);
        createUserIfMissing("doctor2", "doctor123", Role.DOCTOR);
        createUserIfMissing("doctor3", "doctor123", Role.DOCTOR);
        createUserIfMissing("engineer", "engineer123", Role.ENGINEER);
        createUserIfMissing("engineer2", "engineer123", Role.ENGINEER);
        createUserIfMissing("engineer3", "engineer123", Role.ENGINEER);
    }

    private Map<String, Department> seedDepartmentsIfMissing() {
        Department icu = createDepartmentIfMissing("ICU", "Khoa Hồi sức tích cực");
        Department er = createDepartmentIfMissing("ER", "Khoa Cấp cứu");
        Department rad = createDepartmentIfMissing("RAD", "Khoa Chẩn đoán hình ảnh");
        Department sur = createDepartmentIfMissing("SUR", "Khoa Phẫu thuật");
        Department car = createDepartmentIfMissing("CAR", "Khoa Tim mạch");
        Department ped = createDepartmentIfMissing("PED", "Khoa Nhi");
        Department lab = createDepartmentIfMissing("LAB", "Phòng Xét nghiệm");

        return Map.of(
                "ICU", icu,
                "ER", er,
                "RAD", rad,
                "SUR", sur,
                "CAR", car,
                "PED", ped,
                "LAB", lab
        );
    }

    private void seedAssetsIfMissing(Map<String, Department> departments) {
        createAssetIfMissing("AST001", "MRI Scanner - Siemens Magnetom", departments.get("RAD"),
                money("2500000000"), money("3000000000"), LocalDate.of(2023, 1, 15), LocalDate.of(2028, 1, 15), AssetStatus.BROKEN);
        createAssetIfMissing("AST002", "Ventilator - Drager Evita", departments.get("ICU"),
                money("450000000"), money("520000000"), LocalDate.of(2024, 3, 10), LocalDate.of(2027, 3, 10), AssetStatus.UNDER_MAINTENANCE);
        createAssetIfMissing("AST003", "Ultrasound - GE Voluson E10", departments.get("RAD"),
                money("780000000"), money("900000000"), LocalDate.of(2022, 9, 5), LocalDate.of(2026, 9, 5), AssetStatus.MAINTENANCE_DUE);
        createAssetIfMissing("AST004", "X-Ray Machine - Philips Digital", departments.get("ER"),
                money("1200000000"), money("1450000000"), LocalDate.of(2021, 11, 20), LocalDate.of(2026, 11, 20), AssetStatus.AVAILABLE);
        createAssetIfMissing("AST005", "Patient Monitor - Mindray ePM 10", departments.get("ICU"),
                money("120000000"), money("150000000"), LocalDate.of(2024, 6, 1), LocalDate.of(2027, 6, 1), AssetStatus.AVAILABLE);
        createAssetIfMissing("AST006", "Infusion Pump - Baxter Colleague", departments.get("SUR"),
                money("65000000"), money("80000000"), LocalDate.of(2023, 8, 12), LocalDate.of(2026, 8, 12), AssetStatus.AVAILABLE);
        
        // Add new diverse assets
        createAssetIfMissing("AST007", "ECG Machine - GE MAC 2000", departments.get("CAR"),
                money("95000000"), money("110000000"), LocalDate.of(2023, 5, 20), LocalDate.of(2026, 5, 20), AssetStatus.AVAILABLE);
        createAssetIfMissing("AST008", "Incubator - Ohmeda Giraffe", departments.get("PED"),
                money("350000000"), money("400000000"), LocalDate.of(2024, 1, 10), LocalDate.of(2027, 1, 10), AssetStatus.BROKEN);
        createAssetIfMissing("AST009", "Anesthesia Workstation - GE Aisys", departments.get("SUR"),
                money("850000000"), money("980000000"), LocalDate.of(2022, 12, 1), LocalDate.of(2026, 12, 1), AssetStatus.UNDER_MAINTENANCE);
        createAssetIfMissing("AST010", "Hematology Analyzer - Sysmex XN-1000", departments.get("LAB"),
                money("620000000"), money("700000000"), LocalDate.of(2023, 2, 28), LocalDate.of(2027, 2, 28), AssetStatus.AVAILABLE);
        createAssetIfMissing("AST011", "Dialysis Machine - Fresenius 4008S", departments.get("ICU"),
                money("380000000"), money("440000000"), LocalDate.of(2021, 8, 15), LocalDate.of(2026, 8, 15), AssetStatus.MAINTENANCE_DUE);
        createAssetIfMissing("AST012", "Autoclave - Tuttnauer 3870", departments.get("SUR"),
                money("180000000"), money("210000000"), LocalDate.of(2022, 10, 5), LocalDate.of(2027, 10, 5), AssetStatus.AVAILABLE);
        createAssetIfMissing("AST013", "CT Scanner - Toshiba Aquilion", departments.get("RAD"),
                money("3200000000"), money("3800000000"), LocalDate.of(2020, 6, 30), LocalDate.of(2025, 6, 30), AssetStatus.AVAILABLE);
        createAssetIfMissing("AST014", "Syringe Pump - B. Braun Perfusor", departments.get("ICU"),
                money("45000000"), money("55000000"), LocalDate.of(2024, 2, 18), LocalDate.of(2027, 2, 18), AssetStatus.AVAILABLE);
        createAssetIfMissing("AST015", "Endoscopy Tower - Olympus CV-190", departments.get("SUR"),
                money("1100000000"), money("1300000000"), LocalDate.of(2023, 11, 12), LocalDate.of(2028, 11, 12), AssetStatus.AVAILABLE);
        createAssetIfMissing("AST016", "Electrosurgical Unit - Valleylab ForceTriad", departments.get("SUR"),
                money("290000000"), money("330000000"), LocalDate.of(2022, 4, 22), LocalDate.of(2026, 4, 22), AssetStatus.AVAILABLE);
        createAssetIfMissing("AST017", "Blood Gas Analyzer - Radiometer ABL800", departments.get("LAB"),
                money("270000000"), money("310000000"), LocalDate.of(2023, 9, 9), LocalDate.of(2026, 9, 9), AssetStatus.AVAILABLE);
        createAssetIfMissing("AST018", "Centrifuge - Hettich Rotofix", departments.get("LAB"),
                money("35000000"), money("42000000"), LocalDate.of(2024, 5, 5), LocalDate.of(2027, 5, 5), AssetStatus.AVAILABLE);
        createAssetIfMissing("AST019", "Defibrillator - Zoll M Series", departments.get("ER"),
                money("190000000"), money("220000000"), LocalDate.of(2023, 10, 15), LocalDate.of(2026, 10, 15), AssetStatus.AVAILABLE);
        createAssetIfMissing("AST020", "Dental Chair Unit - Sirona Intego", departments.get("SUR"),
                money("310000000"), money("360000000"), LocalDate.of(2022, 7, 7), LocalDate.of(2027, 7, 7), AssetStatus.AVAILABLE);
    }

    private void seedInventoryIfMissing() {
        createInventoryIfMissing("LCD Display Panel", 10, money("2500000"));
        createInventoryIfMissing("Power Supply Unit", 5, money("1800000"));
        createInventoryIfMissing("Oxygen Sensor", 50, money("450000"));
        createInventoryIfMissing("Thermal Printer Paper", 100, money("25000"));
        
        // Add new replacement/maintenance parts
        createInventoryIfMissing("ECG Lead Cable 5-wire", 15, money("1200000"));
        createInventoryIfMissing("Ultrasound Probe Linear", 2, money("45000000"));
        createInventoryIfMissing("Backup Battery 12V 7Ah", 20, money("350000"));
        createInventoryIfMissing("Syringe Pump Plunger", 30, money("850000"));
        createInventoryIfMissing("Anesthesia Breathing Circuit", 40, money("600000"));
        createInventoryIfMissing("SpO2 Sensor Probe", 25, money("950000"));
        createInventoryIfMissing("NIBP Cuff Adult", 35, money("400000"));
        createInventoryIfMissing("LED Surgical Bulb", 8, money("1500000"));
        createInventoryIfMissing("HEPA Filter", 12, money("1100000"));
        createInventoryIfMissing("Suction Canister 2L", 50, money("150000"));
    }

    private void seedServiceRequestsIfMissing() {
        User doctorObj = userRepository.findByUsername("doctor").orElse(null);
        User engineerObj = userRepository.findByUsername("engineer").orElse(null);
        if (doctorObj == null) return;

        if (serviceRequestRepository.count() > 0) {
            return;
        }

        createServiceRequestIfPresent("AST001", doctorObj, null, "Hình ảnh bị nhiễu sọc ngang khi quét ở cường độ cao.", RequestStatus.PENDING, RequestPriority.HIGH);
        createServiceRequestIfPresent("AST002", doctorObj, engineerObj, "Lỗi cảm biến oxy và pin dự phòng không tích điện.", RequestStatus.ASSIGNED, RequestPriority.CRITICAL);
        createServiceRequestIfPresent("AST008", doctorObj, null, "Lồng ấp không gia nhiệt ổn định, lệch 2 độ C so với cài đặt.", RequestStatus.PENDING, RequestPriority.HIGH);
        createServiceRequestIfPresent("AST009", doctorObj, engineerObj, "Bảo trì định kỳ định chuẩn hệ thống khí gây mê.", RequestStatus.ASSIGNED, RequestPriority.MEDIUM);
        createServiceRequestIfPresent("AST011", doctorObj, null, "Bảo trì định kỳ: Vệ sinh màng lọc và khử trùng đường ống nước RO.", RequestStatus.PENDING, RequestPriority.MEDIUM);
        createServiceRequestIfPresent("AST003", doctorObj, engineerObj, "Thay thế đầu dò Linear bị nứt vỏ bọc ngoài.", RequestStatus.COMPLETED, RequestPriority.MEDIUM);
    }

    private void createServiceRequestIfPresent(String assetCode, User reportedBy, User assignedEngineer, String description, RequestStatus status, RequestPriority priority) {
        assetRepository.findByCode(assetCode).ifPresent(asset -> {
            serviceRequestRepository.save(ServiceRequest.builder()
                    .asset(asset)
                    .reportedBy(reportedBy)
                    .assignedEngineer(assignedEngineer)
                    .description(description)
                    .status(status)
                    .priority(priority)
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .completedAt(status == RequestStatus.COMPLETED ? LocalDateTime.now().minusDays(1) : null)
                    .build());
            log.info("Created default service request for asset: {}", assetCode);
        });
    }

    private void seedMaintenanceSchedulesIfMissing() {
        if (maintenanceScheduleRepository.count() > 0) {
            return;
        }

        createMaintenanceScheduleIfPresent("AST001", LocalDate.now().plusDays(1), "Kiểm tra chất làm lạnh helium và hiệu chuẩn từ trường.");
        createMaintenanceScheduleIfPresent("AST003", LocalDate.now().plusDays(3), "Bảo dưỡng định kỳ đầu dò và cập nhật phần mềm.");
        createMaintenanceScheduleIfPresent("AST007", LocalDate.now().plusDays(5), "Hiệu chuẩn các kênh đo điện tim.");
        createMaintenanceScheduleIfPresent("AST011", LocalDate.now().minusDays(1), "Vệ sinh màng lọc và khử trùng đường ống nước RO.");
    }

    private void createMaintenanceScheduleIfPresent(String assetCode, LocalDate scheduledDate, String notes) {
        assetRepository.findByCode(assetCode).ifPresent(asset -> {
            maintenanceScheduleRepository.save(MaintenanceSchedule.builder()
                    .asset(asset)
                    .scheduledDate(scheduledDate)
                    .notes(notes)
                    .createdAt(LocalDateTime.now().minusDays(3))
                    .build());
            log.info("Created default maintenance schedule for asset: {}", assetCode);
        });
    }

    private void createUserIfMissing(String username, String password, Role role) {
        if (userRepository.findByUsername(username).isPresent()) {
            return;
        }

        userRepository.save(User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .role(role)
                .build());
        log.info("Created default user: {}", username);
    }

    private Department createDepartmentIfMissing(String code, String name) {
        return departmentRepository.findByCode(code)
                .orElseGet(() -> {
                    Department department = departmentRepository.save(Department.builder()
                            .code(code)
                            .name(name)
                            .build());
                    log.info("Created default department: {}", code);
                    return department;
                });
    }

    private void createAssetIfMissing(
            String code,
            String name,
            Department department,
            BigDecimal purchasePrice,
            BigDecimal replacementCost,
            LocalDate purchaseDate,
            LocalDate warrantyUntil,
            AssetStatus status
    ) {
        if (assetRepository.findByCode(code).isPresent()) {
            return;
        }

        assetRepository.save(Asset.builder()
                .code(code)
                .name(name)
                .status(status)
                .department(department)
                .purchasePrice(purchasePrice)
                .replacementCost(replacementCost)
                .purchaseDate(purchaseDate)
                .warrantyUntil(warrantyUntil)
                .nextMaintenanceDate(status == AssetStatus.MAINTENANCE_DUE ? LocalDate.now().minusDays(3) : null)
                .build());
        log.info("Created default asset: {}", code);
    }

    private void createInventoryIfMissing(String partName, int quantity, BigDecimal unitCost) {
        if (inventoryRepository.existsByPartName(partName)) {
            return;
        }

        inventoryRepository.save(Inventory.builder()
                .partName(partName)
                .quantity(quantity)
                .unitCost(unitCost)
                .build());
        log.info("Created default inventory item: {}", partName);
    }

    private BigDecimal money(String value) {
        return new BigDecimal(value);
    }
}
