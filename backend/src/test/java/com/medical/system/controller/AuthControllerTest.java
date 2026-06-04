package com.medical.system.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medical.system.AbstractIntegrationTest;
import com.medical.system.dto.auth.LoginRequest;
import com.medical.system.model.entity.User;
import com.medical.system.model.enums.Role;
import com.medical.system.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@Transactional
class AuthControllerTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void login_withValidCredentials_shouldReturnTokens() throws Exception {
        // Arrange
        User user = User.builder()
                .username("testdoctor")
                .password(passwordEncoder.encode("password123"))
                .role(Role.DOCTOR)
                .build();
        userRepository.save(user);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testdoctor");
        loginRequest.setPassword("password123");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.refreshToken").exists())
                .andExpect(jsonPath("$.data.role").value("DOCTOR"));
    }

    @Test
    void login_withInvalidCredentials_shouldReturn401() throws Exception {
        // Arrange
        User user = User.builder()
                .username("testdoctor")
                .password(passwordEncoder.encode("password123"))
                .role(Role.DOCTOR)
                .build();
        userRepository.save(user);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testdoctor");
        loginRequest.setPassword("wrongpassword");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("ERROR"));
    }
}
