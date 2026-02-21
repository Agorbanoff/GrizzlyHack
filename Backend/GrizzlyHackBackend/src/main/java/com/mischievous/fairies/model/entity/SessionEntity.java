package com.mischievous.fairies.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Entity
@Table(name = "browsing_sessions")
@Data
public class SessionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private UserEntity user;

    @Column(name = "session_start", nullable = false, updatable = false)
    private Instant sessionStart;

    @Column(name = "session_end", nullable = false, updatable = false)
    private Instant sessionEnd;



    @PrePersist
    private void prePersist() {
        if (this.sessionStart == null) {
            this.sessionStart = Instant.now();
        }
    }

}
