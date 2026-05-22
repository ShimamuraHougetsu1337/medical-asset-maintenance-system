package com.medical.system.repository;

import com.medical.system.model.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for RefreshToken persistence operations.
 */
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    /** Revoke all active tokens for a given username (used on logout). */
    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.username = :username AND r.revoked = false")
    int revokeAllByUsername(String username);

    /** Delete all tokens for a user (cleanup). */
    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.username = :username")
    int deleteAllByUsername(String username);
}
