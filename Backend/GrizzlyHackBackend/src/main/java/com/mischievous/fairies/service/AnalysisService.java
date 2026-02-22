package com.mischievous.fairies.service;

import com.mischievous.fairies.model.dto.res.PagedResponse;
import com.mischievous.fairies.model.dto.res.SessionResDto;
import com.mischievous.fairies.model.entity.SessionEntity;
import com.mischievous.fairies.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnalysisService {

    private final SessionRepository sessionRepository;

    @Autowired
    public AnalysisService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }


    public PagedResponse<SessionResDto> getLongestSessions(Long userId, Pageable pageable) {
        Instant oneWeekAgo = Instant.now().minus(7, ChronoUnit.DAYS);

        int limit = pageable.getPageSize();
        int offset = pageable.getPageNumber() * pageable.getPageSize();

        List<SessionEntity> sessions = sessionRepository.findLongestSessionsSince(userId, oneWeekAgo, limit, offset);
        long total = sessionRepository.countLongestSessionsSince(userId, oneWeekAgo);

        List<SessionResDto> sessionResDtos = new ArrayList<>();
        for (SessionEntity sessionEntity : sessions) {
            SessionResDto sessionResDto = new SessionResDto();
            sessionResDto.setId(sessionEntity.getId());
            sessionResDto.setSessionStart(sessionEntity.getSessionStart());
            sessionResDto.setSessionEnd(sessionEntity.getSessionEnd());
            sessionResDtos.add(sessionResDto);
        }
        PagedResponse<SessionResDto> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(sessionResDtos);
        pagedResponse.setPageNumber(pageable.getPageNumber());
        pagedResponse.setPageSize(pageable.getPageSize());
        pagedResponse.setTotalElements(total);
        return pagedResponse;
    }
}
