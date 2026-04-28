package com.medical.system.repository;

import com.medical.system.model.entity.ServiceLogPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceLogPartRepository extends JpaRepository<ServiceLogPart, Long> {
}
