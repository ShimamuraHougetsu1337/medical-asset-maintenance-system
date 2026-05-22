package com.medical.system.service;

import com.medical.system.exception.BusinessException;
import com.medical.system.model.entity.RefreshToken;
import com.medical.system.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Service responsible for lifecycle management of refresh tokens:
 * creation, verification, rotation, and revocation.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    /**
     * Creates a new refresh token for the given username and persists it.
     *
     * @param username the authenticated user's username
     * @return the persisted RefreshToken entity
     */
    @Transactional
    public RefreshToken createRefreshToken(String username) {
        RefreshToken refreshToken = RefreshToken.builder()
                .username(username)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshExpirationMs))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Looks up a refresh token by its string value, verifying it exists,
     * has not been revoked, and has not expired.
     *
     * @param token the raw token string sent by the client
     * @return the valid RefreshToken entity
     * @throws BusinessException if the token is invalid, revoked, or expired
     */
    @Transactional
    public RefreshToken verifyToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            throw new BusinessException("Refresh token has been revoked. Please log in again.");
        }

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            // Mark as revoked and persist before throwing
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new BusinessException("Refresh token has expired. Please log in again.");
        }

        return refreshToken;
    }

    /**
     * Rotates a refresh token: revokes the old one and issues a new one.
     * This is the recommended "refresh token rotation" security pattern.
     *
     * @param oldToken the RefreshToken entity to invalidate
     * @return a freshly created RefreshToken for the same user
     */
    @Transactional
    public RefreshToken rotateToken(RefreshToken oldToken) {
        oldToken.setRevoked(true);
        refreshTokenRepository.save(oldToken);
        return createRefreshToken(oldToken.getUsername());
    }

    /**
     * Revokes all active refresh tokens for a user (called on logout).
     *
     * @param username the user whose tokens should be revoked
     */
    @Transactional
    public void revokeAllByUsername(String username) {
        refreshTokenRepository.revokeAllByUsername(username);
    }
}
