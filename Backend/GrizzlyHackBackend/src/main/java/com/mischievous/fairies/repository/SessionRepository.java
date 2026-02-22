package com.mischievous.fairies.repository;

import com.mischievous.fairies.model.entity.SessionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<SessionEntity, Long> {
    Page<SessionEntity> findByUser_Id(Long userId, Pageable pageable);
    Optional<SessionEntity> findByUser_IdAndSessionEndIsNull(Long userId);

    Optional<SessionEntity> findByUser_IdAndId(Long userId, Long id);
}
