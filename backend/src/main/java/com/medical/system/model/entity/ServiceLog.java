package com.medical.system.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "service_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_request_id", nullable = false)
    private ServiceRequest serviceRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "engineer_id", nullable = false)
    private User engineer;

    @Column(nullable = false, length = 1000)
    private String resolutionDetails;

    @OneToMany(mappedBy = "serviceLog", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ServiceLogPart> usedParts = new ArrayList<>();

    // Using TEXT for compatibility, storing JSON string
    @Column(columnDefinition = "TEXT")
    private String additionalLogData;


    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

