package com.medical.system.controller;

import com.medical.system.dto.ApiResponse;
import com.medical.system.dto.auth.ChangePasswordRequest;
import com.medical.system.dto.auth.LoginRequest;
import com.medical.system.dto.auth.LoginResponse;
import com.medical.system.dto.auth.RefreshTokenRequest;
import com.medical.system.dto.auth.RefreshTokenResponse;
import com.medical.system.exception.BusinessException;
import com.medical.system.model.entity.RefreshToken;
import com.medical.system.model.entity.User;
import com.medical.system.repository.UserRepository;
import com.medical.system.security.JwtService;
import com.medical.system.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for authentication-related endpoints.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final JwtService jwtService;
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final RefreshTokenService refreshTokenService;

        /**
         * Authenticates a user and returns a JWT access token plus a refresh token.
         */
        @PostMapping("/login")
        public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
                // Authenticate the user
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                // Fetch user to get the role (or extract from authentication principal)
                User user = userRepository.findByUsername(loginRequest.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found after authentication"));

                // Generate access token
                String accessToken = jwtService.generateAccessToken(user.getUsername(), user.getRole().name());

                // Generate and persist refresh token
                RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getUsername());

                LoginResponse loginResponse = LoginResponse.builder()
                                .token(accessToken)
                                .refreshToken(refreshToken.getToken())
                                .username(user.getUsername())
                                .role(user.getRole().name())
                                .build();

                return ResponseEntity.ok(ApiResponse.success(loginResponse, "Login successful"));
        }

        /**
         * Issues a new access token and rotated refresh token given a valid refresh token.
         * Uses refresh token rotation: the old refresh token is revoked and a new one is issued.
         */
        @PostMapping("/refresh-token")
        public ResponseEntity<ApiResponse<RefreshTokenResponse>> refreshToken(
                        @Valid @RequestBody RefreshTokenRequest request) {
                try {
                        // Verify the incoming refresh token (throws if invalid/expired/revoked)
                        RefreshToken existingToken = refreshTokenService.verifyToken(request.getRefreshToken());

                        // Fetch user role for the new access token
                        User user = userRepository.findByUsername(existingToken.getUsername())
                                        .orElseThrow(() -> new BusinessException("User not found"));

                        // Rotate: revoke old, create new refresh token
                        RefreshToken newRefreshToken = refreshTokenService.rotateToken(existingToken);

                        // Generate new access token
                        String newAccessToken = jwtService.generateAccessToken(user.getUsername(), user.getRole().name());

                        RefreshTokenResponse response = RefreshTokenResponse.builder()
                                        .accessToken(newAccessToken)
                                        .refreshToken(newRefreshToken.getToken())
                                        .build();

                        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
                } catch (BusinessException e) {
                        return ResponseEntity.status(401).body(ApiResponse.error(e.getMessage()));
                }
        }

        /**
         * Logs out the currently authenticated user by revoking all their refresh tokens.
         */
        @PostMapping("/logout")
        public ResponseEntity<ApiResponse<String>> logout() {
                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                if (username != null && !"anonymousUser".equals(username)) {
                        refreshTokenService.revokeAllByUsername(username);
                }
                return ResponseEntity.ok(ApiResponse.success("Logged out successfully", "Success"));
        }

        @PostMapping("/change-password")
        public ResponseEntity<ApiResponse<String>> changePassword(
                        @Valid @RequestBody ChangePasswordRequest request) {
                String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
                if (username == null || "anonymousUser".equals(username)) {
                        return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
                }

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new com.medical.system.exception.ResourceNotFoundException("User not found"));

                if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                        return ResponseEntity.badRequest().body(ApiResponse.error("Incorrect current password"));
                }

                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(user);

                return ResponseEntity.ok(ApiResponse.success("Password changed successfully", "Success"));
        }
}
