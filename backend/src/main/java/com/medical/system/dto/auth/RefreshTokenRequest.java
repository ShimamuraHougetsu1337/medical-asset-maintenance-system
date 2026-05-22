package com.medical.system.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request body for the /api/auth/refresh-token endpoint.
 */
@Data
public class RefreshTokenRequest {

    @NotBlank(message = "Refresh token must not be blank")
    private String refreshToken;
}
