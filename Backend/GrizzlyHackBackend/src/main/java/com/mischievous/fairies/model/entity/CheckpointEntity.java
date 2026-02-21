package com.mischievous.fairies.model;

import jakarta.persistence.*;
import lombok.Data;

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
}
