package com.mischievous.fairies.repository;

import com.mischievous.fairies.model.entity.SessionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<SessionEntity, Long> {
    Page<SessionEntity> findByUser_Id(Long userId, Pageable pageable);
    Optional<SessionEntity> findByUser_IdAndSessionEndIsNull(Long userId);
    Optional<SessionEntity> findByUser_IdAndId(Long userId, Long id);

    // Return a limited page of longest sessions (native query). Use LIMIT/OFFSET so Spring won't try to append its own ORDER/BY fragment.
    @Query(value = """
    SELECT *
    FROM sessions s
    WHERE s.user_id = :userId
      AND s.session_start >= :from
      AND s.session_start <= :to
    ORDER BY EXTRACT(EPOCH FROM (s.session_end - s.session_start)) DESC
    LIMIT :limit OFFSET :offset
    """,
            nativeQuery = true)
    List<SessionEntity> findLongestSessionsSince(@Param("userId") Long userId,
                                                 @Param("from") Instant from,
                                                 @Param("to") Instant to,
                                                 @Param("limit") int limit,
                                                 @Param("offset") int offset
    );

    // Count query to determine total elements for pagination
    @Query(value = """
    SELECT count(*)
    FROM sessions s
    WHERE s.user_id = :userId
      AND s.session_start >= :from
      AND s.session_start <= :to
    """,
            nativeQuery = true)
    long countLongestSessionsSince(@Param("userId") Long userId,
                                   @Param("from") Instant from,
                                   @Param("to") Instant to);
}