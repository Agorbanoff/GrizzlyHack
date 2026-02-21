package com.mischievous.fairies.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Entity
@Table(name = "checkpoints")
@Data
public class CheckpointEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "session_id", referencedColumnName = "id", nullable = false)
    private BrowsingSessionEntity session;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private Instant timestamp;


    @PrePersist
    private void prePersist() {
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
        }
    }


}
