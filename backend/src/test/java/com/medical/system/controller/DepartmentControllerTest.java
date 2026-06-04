package com.medical.system.controller;

import com.medical.system.AbstractIntegrationTest;
import com.medical.system.model.entity.Department;
import com.medical.system.repository.DepartmentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@Transactional
class DepartmentControllerTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getAllDepartments_shouldReturnList() throws Exception {
        // Arrange
        Department dept = Department.builder()
                .code("CARDIO")
                .name("Cardiology")
                .build();
        departmentRepository.save(dept);

        // Act & Assert
        mockMvc.perform(get("/api/departments")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data[0].code").value("CARDIO"))
                .andExpect(jsonPath("$.data[0].name").value("Cardiology"));
    }
}
