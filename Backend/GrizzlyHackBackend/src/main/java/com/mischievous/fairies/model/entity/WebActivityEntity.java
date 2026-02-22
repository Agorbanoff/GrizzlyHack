package com.mischievous.fairies.model.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "url_activities")
@Data
public class WebActivityEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String host;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private Long timeSpentMillis;

    @ManyToOne
    @JoinColumn(name = "checkpoint_id", referencedColumnName = "id", nullable = false)
    private CheckpointEntity checkpoint;
}
