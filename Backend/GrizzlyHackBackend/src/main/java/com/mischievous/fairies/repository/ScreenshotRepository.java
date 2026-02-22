package com.mischievous.fairies.repository;

import com.mischievous.fairies.model.entity.ScreenshotEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScreenshotRepository extends JpaRepository<ScreenshotEntity, Long> {
    Optional<ScreenshotEntity> findByFilePath(String filePath);

    Optional<ScreenshotEntity> findByCheckpoint_IdAndId(Long checkpointId, Long id);

    List<ScreenshotEntity> findAllByCheckpoint_Id(Long checkpointId);
}
