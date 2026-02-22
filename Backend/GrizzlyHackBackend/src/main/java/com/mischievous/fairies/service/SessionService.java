package com.mischievous.fairies.service;

import com.mischievous.fairies.common.exception.CustomException;
import com.mischievous.fairies.model.dto.res.PagedResponse;
import com.mischievous.fairies.model.dto.res.SessionResDto;
import com.mischievous.fairies.model.dto.res.StartSessionResDto;
import com.mischievous.fairies.model.entity.SessionEntity;
import com.mischievous.fairies.model.entity.UserEntity;
import com.mischievous.fairies.repository.SessionRepository;
import com.mischievous.fairies.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    public SessionService(SessionRepository sessionRepository, UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    public Long startSession(Long userId) {
        Optional<UserEntity> userEntityOptional = userRepository.findById(userId);
        UserEntity userEntity = userEntityOptional.orElseThrow(() -> new IllegalArgumentException("User not found"));

        SessionEntity sessionEntity = new SessionEntity();
        sessionEntity.setUser(userEntity);
        sessionEntity.setSessionStart(Instant.now());
        sessionEntity.setSessionEnd(sessionEntity.getSessionStart().plusSeconds(300));
        sessionRepository.save(sessionEntity);

        return sessionEntity.getId();
    }

    public void keepAlive(Long sessionId) {
        Optional<SessionEntity> sessionOptional = sessionRepository.findById(sessionId);
        if (sessionOptional.isPresent()) {
            SessionEntity session = sessionOptional.get();
            session.setSessionEnd(Instant.now().plusSeconds(300));
            sessionRepository.save(session);
        }
    }


    public PagedResponse<SessionResDto> getUserSessions(Long userId, Pageable pageable) {
        Page<SessionEntity> page = sessionRepository.findByUser_Id(userId, pageable);
        List<SessionResDto> content = new ArrayList<>();
        for (SessionEntity sessionEntity : page.getContent()) {
            SessionResDto dto = new SessionResDto();
            dto.setId(sessionEntity.getId());
            dto.setSessionStart(sessionEntity.getSessionStart());
            dto.setSessionEnd(sessionEntity.getSessionEnd());
            content.add(dto);
        }
        PagedResponse<SessionResDto> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(content);
        pagedResponse.setTotalElements(page.getTotalElements());
        pagedResponse.setPageNumber(page.getNumber());
        pagedResponse.setPageSize(page.getSize());
        return pagedResponse;
    }


    @Transactional
    public void endSession(Long userId) {
        Optional<SessionEntity> sessionOptional = sessionRepository.findByUser_IdAndSessionEndIsNull(userId);
        if (sessionOptional.isPresent()) {
            SessionEntity session = sessionOptional.get();
            session.setSessionEnd(Instant.now());
            sessionRepository.save(session);
        } else {
            throw new IllegalArgumentException("No active session for user");
        }
    }

    @Transactional
    public void deleteSession(Long sessionId, Long requesterUserId) throws CustomException {
        Optional<SessionEntity> sessionOptional = sessionRepository.findById(sessionId);
        if (sessionOptional.isEmpty()) {
            throw new CustomException("Session not found", HttpStatus.NOT_FOUND);
        }
        SessionEntity session = sessionOptional.get();
        if (session.getUser() == null || !session.getUser().getId().equals(requesterUserId)) {
            throw new CustomException("Forbidden: cannot delete someone else's session", HttpStatus.FORBIDDEN);
        }
        sessionRepository.deleteById(sessionId);
    }
}
