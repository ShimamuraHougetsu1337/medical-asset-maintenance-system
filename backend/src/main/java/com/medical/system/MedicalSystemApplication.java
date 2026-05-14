package com.medical.system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // Kích hoạt Cron Job cho Phase 5
public class MedicalSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(MedicalSystemApplication.class, args);
    }
}

