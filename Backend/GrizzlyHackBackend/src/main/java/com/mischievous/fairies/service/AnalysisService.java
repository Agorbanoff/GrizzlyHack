package com.mischievous.fairies.service;

import com.mischievous.fairies.model.dto.res.PagedResponse;
import com.mischievous.fairies.model.dto.res.SessionAnalysisDto;
import com.mischievous.fairies.model.dto.res.WebActivityAnalysisDto;
import com.mischievous.fairies.model.entity.CheckpointEntity;
import com.mischievous.fairies.model.entity.SessionEntity;
import com.mischievous.fairies.model.entity.WebActivityEntity;
import com.mischievous.fairies.repository.CheckpointRepository;
import com.mischievous.fairies.repository.SessionRepository;
import com.mischievous.fairies.repository.WebActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalysisService {

    private final SessionRepository sessionRepository;
    private final WebActivityRepository webActivityRepository;
    private final CheckpointRepository checkpointRepository;

    @Autowired
    public AnalysisService(SessionRepository sessionRepository,
                           WebActivityRepository webActivityRepository,
                           CheckpointRepository checkpointRepository) {
        this.sessionRepository = sessionRepository;
        this.webActivityRepository = webActivityRepository;
        this.checkpointRepository = checkpointRepository;
    }


    public PagedResponse<SessionAnalysisDto> getLongestSessions(Long userId, Pageable pageable, Instant from, Instant to) {

        int limit = pageable.getPageSize();
        int offset = pageable.getPageNumber() * pageable.getPageSize();

        List<SessionEntity> sessions = sessionRepository.findLongestSessionsSince(userId, from, to, limit, offset);
        long total = sessionRepository.countLongestSessionsSince(userId, from, to);

        List<SessionAnalysisDto> sessionResDtos = new ArrayList<>();
        for (SessionEntity sessionEntity : sessions) {
            SessionAnalysisDto sessionResDto = new SessionAnalysisDto();
            sessionResDto.setId(sessionEntity.getId());
            sessionResDto.setSessionStart(sessionEntity.getSessionStart());
            sessionResDto.setSessionEnd(sessionEntity.getSessionEnd());
            sessionResDto.setTotalTime(sessionEntity.getSessionEnd().toEpochMilli() - sessionEntity.getSessionStart().toEpochMilli());
            sessionResDtos.add(sessionResDto);
        }
        PagedResponse<SessionAnalysisDto> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(sessionResDtos);
        pagedResponse.setPageNumber(pageable.getPageNumber());
        pagedResponse.setPageSize(pageable.getPageSize());
        pagedResponse.setTotalElements(total);
        return pagedResponse;
    }

    public List<WebActivityAnalysisDto> getWebActivitiesMostTimeSpent(Long userId, Instant from, Instant to) {
            List<CheckpointEntity> checkpointEntities = checkpointRepository
                    .findAllBySession_User_IdAndSession_SessionStartAfterAndSession_SessionStartBefore(userId,from, to);
            Map<String, WebActivityAnalysisDto> webActivities = new HashMap<>();
            for (CheckpointEntity checkpointEntity : checkpointEntities) {
                for (WebActivityEntity webActivityEntity : checkpointEntity.getWebActivities()) {
                    if (webActivities.containsKey(webActivityEntity.getHost())) {
                        WebActivityAnalysisDto webActivityAnalysisDto = webActivities.get(webActivityEntity.getHost());
                        webActivityAnalysisDto.setTotalTime(webActivityAnalysisDto.getTotalTime() +
                                webActivityEntity.getTimeSpentMillis());
                    } else {
                        webActivities.put(webActivityEntity.getHost(), new WebActivityAnalysisDto(webActivityEntity.getHost(), webActivityEntity.getTimeSpentMillis()));
                    }
                }
            }
            List<WebActivityAnalysisDto> webActivityDtos = new ArrayList<>(webActivities.values());
            webActivityDtos.sort((a, b) -> Long.compare(b.getTotalTime(), a.getTotalTime()));
            return webActivityDtos;
    }

}
