package com.medical.system.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Entity for persisting refresh tokens.
 * Each token is linked to a username, has an expiry date, and a revoked flag.
 */
@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The opaque token value (UUID) stored in DB and sent to client. */
    @Column(nullable = false, unique = true, length = 512)
    private String token;

    /** Username this token belongs to. */
    @Column(nullable = false)
    private String username;

    /** Absolute expiry instant. */
    @Column(nullable = false)
    private Instant expiryDate;

    /** Set to true when the token has been explicitly revoked (logout). */
    @Column(nullable = false)
    @Builder.Default
    private boolean revoked = false;
}
