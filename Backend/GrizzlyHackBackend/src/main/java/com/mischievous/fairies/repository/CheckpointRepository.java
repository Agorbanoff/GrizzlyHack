package com.mischievous.fairies.repository;

import com.mischievous.fairies.model.entity.CheckpointEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CheckpointRepository extends JpaRepository<CheckpointEntity, Long> {
    List<CheckpointEntity> findBySession_Id(Long sessionId);
    Page<CheckpointEntity> findBySession_Id(Long sessionId, Pageable pageable);
}
