package com.mischievous.fairies.service;

import com.mischievous.fairies.model.dto.res.SessionResDto;
import com.mischievous.fairies.model.entity.SessionEntity;
import com.mischievous.fairies.repository.SessionRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class AnalysisService {

    private final SessionRepository sessionRepository;

    public AnalysisService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }


    public List<SessionResDto> getLongestSessions(Long userId, Pageable pageable) {
        Instant oneWeekAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        List<SessionEntity> sessions = sessionRepository.findLongestSessionsSince(userId, oneWeekAgo, pageable);
    }
}
