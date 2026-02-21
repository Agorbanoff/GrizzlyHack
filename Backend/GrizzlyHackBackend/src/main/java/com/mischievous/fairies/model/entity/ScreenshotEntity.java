package com.mischievous.fairies.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Entity
@Table(name = "screenshots")
@Data
public class ScreenshotEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "checkpoint_id", referencedColumnName = "id", nullable = false)
    private CheckpointEntity checkpoint;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private Instant timestamp;

    @Column(name = "file_path", nullable = false, updatable = false, unique = true)
    private String filePath;

    @Column(name = "description", nullable = false, updatable = false)
    private String description;
}
