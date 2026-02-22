package com.mischievous.fairies.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "checkpoints")
@Data
public class CheckpointEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String url;

    @Column
    private Instant timestamp;

    @ManyToOne
    @JoinColumn(name = "session_id", referencedColumnName = "id", nullable = false)
    private SessionEntity session;

    @OneToMany(mappedBy = "checkpoint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScreenshotEntity> screenshots = new ArrayList<>();


    @PrePersist
    public void prePersist() {
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }
}
