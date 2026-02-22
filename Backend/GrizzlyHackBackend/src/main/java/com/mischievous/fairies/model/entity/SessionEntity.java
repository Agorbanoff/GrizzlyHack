package com.mischievous.fairies.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sessions")
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

    @Column(name = "session_end", nullable = true, updatable = true)
    private Instant sessionEnd;

    @OneToMany(mappedBy = "session",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<CheckpointEntity> checkpoints = new ArrayList<>();

    @PrePersist
    private void prePersist() {
        if (this.sessionStart == null) {
            this.sessionStart = Instant.now();
        }
    }

}
