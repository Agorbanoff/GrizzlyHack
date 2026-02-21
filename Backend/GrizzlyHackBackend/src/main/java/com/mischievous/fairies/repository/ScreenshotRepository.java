package com.mischievous.fairies.repository;

import com.mischievous.fairies.model.entity.ScreenshotEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScreenshotRepository extends JpaRepository<ScreenshotEntity, Long> {
}
