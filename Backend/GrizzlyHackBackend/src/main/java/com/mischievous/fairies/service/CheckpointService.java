package com.mischievous.fairies.service;

import com.mischievous.fairies.model.dto.req.CreateCheckPointReqDto;
import com.mischievous.fairies.model.dto.req.WebActivityDto;
import com.mischievous.fairies.model.dto.res.GetCheckpointResDto;
import com.mischievous.fairies.model.dto.res.PagedResponse;
import com.mischievous.fairies.model.entity.CheckpointEntity;
import com.mischievous.fairies.model.entity.SessionEntity;
import com.mischievous.fairies.model.entity.WebActivityEntity;
import com.mischievous.fairies.repository.CheckpointRepository;
import com.mischievous.fairies.repository.SessionRepository;
import com.mischievous.fairies.repository.WebActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CheckpointService {
    private final CheckpointRepository checkpointRepository;
    private final SessionRepository sessionRepository;
    private final WebActivityRepository webActivityRepository;

    @Autowired
    public CheckpointService(CheckpointRepository checkpointRepository,
                             SessionRepository sessionRepository,
                             WebActivityRepository webActivityRepository) {
        this.checkpointRepository = checkpointRepository;
        this.sessionRepository = sessionRepository;
        this.webActivityRepository = webActivityRepository;
    }

    @Transactional
    public Long createCheckpoint(CreateCheckPointReqDto createCheckPointReqDto, Long userId) {
        Optional<SessionEntity> sessionEntityOptional = sessionRepository.findByUser_IdAndId(userId, createCheckPointReqDto.getSessionId());
        SessionEntity sessionEntity = sessionEntityOptional.orElseThrow(() -> new IllegalArgumentException("No active session for user"));
        if (!sessionEntity.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Session does not belong to user");
        }
        CheckpointEntity checkpointEntity = new CheckpointEntity();
        checkpointEntity.setSession(sessionEntity);
        checkpointEntity.setDescription(createCheckPointReqDto.getDescription());
        checkpointRepository.save(checkpointEntity);
        for (WebActivityDto webActivityDto : createCheckPointReqDto.getWebActivities()) {
            WebActivityEntity webActivityEntity = new WebActivityEntity();
            webActivityEntity.setUrl(webActivityDto.getUrl());
            webActivityEntity.setHost(webActivityDto.getHost());
            webActivityEntity.setTitle(webActivityDto.getTitle());
            webActivityEntity.setTimeSpentMillis(webActivityDto.getTimeSpentMillis());
            webActivityEntity.setCheckpoint(checkpointEntity);
            webActivityRepository.save(webActivityEntity);
        }
        return checkpointEntity.getId();
    }

    public PagedResponse<GetCheckpointResDto> getCheckpointsForSession(Long sessionId, Long userId, Pageable pageable) {
        Optional<SessionEntity> sessionOpt = sessionRepository.findByUser_IdAndId(userId, sessionId);
        Page<CheckpointEntity> checkpointEntities = checkpointRepository.findBySession_Id(sessionId, pageable);
        List<GetCheckpointResDto> checkpointResDtos = new ArrayList<>();
        for (CheckpointEntity checkpointEntity : checkpointEntities.getContent()) {
            GetCheckpointResDto checkpointResDto = new GetCheckpointResDto();
            checkpointResDto.setId(checkpointEntity.getId());
            checkpointResDto.setTimestamp(checkpointEntity.getTimestamp());
            checkpointResDto.setDescription(checkpointEntity.getDescription());
            List<WebActivityDto> webActivitiesDtos = new ArrayList<>();
            for (WebActivityEntity webActivityEntity : checkpointEntity.getWebActivities()) {
                WebActivityDto webActivityDto = new WebActivityDto();
                webActivityDto.setUrl(webActivityEntity.getUrl());
                webActivityDto.setHost(webActivityEntity.getHost());
                webActivityDto.setTitle(webActivityEntity.getTitle());
                webActivityDto.setTimeSpentMillis(webActivityEntity.getTimeSpentMillis());
                webActivitiesDtos.add(webActivityDto);
            }
            checkpointResDto.setWebActivities(webActivitiesDtos);
            checkpointResDtos.add(checkpointResDto);
        }
        PagedResponse<GetCheckpointResDto> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(checkpointResDtos);
        pagedResponse.setPageNumber(checkpointEntities.getNumber());
        pagedResponse.setPageSize(checkpointEntities.getSize());
        pagedResponse.setTotalElements(checkpointEntities.getTotalElements());
        return  pagedResponse;
    }

    @Transactional
    public void deleteCheckpoint(Long checkpointId, Long userId) {
        Optional<CheckpointEntity> checkpointOptional = checkpointRepository.findById(checkpointId);
        CheckpointEntity checkpoint = checkpointOptional.orElseThrow(() -> new IllegalArgumentException("Checkpoint not found"));
        if (!checkpoint.getSession().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not allowed");
        }
        checkpointRepository.deleteById(checkpointId);
    }
}
