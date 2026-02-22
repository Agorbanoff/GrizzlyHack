package com.mischievous.fairies.service;

import com.mischievous.fairies.model.dto.req.CheckPointReqDto;
import com.mischievous.fairies.model.dto.res.CheckpointResDto;
import com.mischievous.fairies.model.dto.res.PagedResponse;
import com.mischievous.fairies.model.entity.CheckpointEntity;
import com.mischievous.fairies.model.entity.ScreenshotEntity;
import com.mischievous.fairies.model.entity.SessionEntity;
import com.mischievous.fairies.repository.CheckpointRepository;
import com.mischievous.fairies.repository.ScreenshotRepository;
import com.mischievous.fairies.repository.SessionRepository;
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
    private final ScreenshotRepository screenshotRepository;

    @Autowired
    public CheckpointService(CheckpointRepository checkpointRepository,
                             SessionRepository sessionRepository,
                             ScreenshotRepository screenshotRepository) {
        this.checkpointRepository = checkpointRepository;
        this.sessionRepository = sessionRepository;
        this.screenshotRepository = screenshotRepository;
    }

    @Transactional
    public void createCheckpoint(CheckPointReqDto checkPointReqDto, Long userId) {
        Optional<SessionEntity> sessionEntityOptional = sessionRepository.findByUser_IdAndId(userId, checkPointReqDto.getSessionId());
        SessionEntity sessionEntity = sessionEntityOptional.orElseThrow(() -> new IllegalArgumentException("No active session for user"));
        if (sessionEntity.getUser().getId().equals(userId)) {
            CheckpointEntity checkpointEntity = new CheckpointEntity();
            checkpointEntity.setSession(sessionEntity);
            checkpointEntity.setUrl(checkPointReqDto.getUrl());
            checkpointRepository.save(checkpointEntity);
        } else {
            throw new IllegalArgumentException("Session does not belong to user");
        }

    }

    public List<CheckpointEntity> getCheckpointsForSession(Long sessionId, Long userId) {
        List<CheckpointEntity> checkpoints = checkpointRepository.findBySession_Id(sessionId);
        // filter to ensure session belongs to user
        checkpoints.removeIf(c -> !c.getSession().getUser().getId().equals(userId));
        return checkpoints;
    }

    public PagedResponse<CheckpointResDto> getCheckpointsForSession(Long sessionId, Long userId, Pageable pageable) {
        Optional<SessionEntity> sessionOpt = sessionRepository.findByUser_IdAndId(userId, sessionId);
        Page<CheckpointEntity> checkpointEntities = checkpointRepository.findBySession_Id(sessionId, pageable);
        List<CheckpointResDto> checkpointResDtos = new ArrayList<>();
        for (CheckpointEntity checkpointEntity : checkpointEntities.getContent()) {
            CheckpointResDto checkpointResDto = new CheckpointResDto();
            checkpointResDto.setId(checkpointEntity.getId());
            checkpointResDto.setUrl(checkpointEntity.getUrl());
            checkpointResDto.setTimestamp(checkpointEntity.getTimestamp());
            checkpointResDtos.add(checkpointResDto);
        }
        PagedResponse<CheckpointResDto> pagedResponse = new PagedResponse<>();
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
