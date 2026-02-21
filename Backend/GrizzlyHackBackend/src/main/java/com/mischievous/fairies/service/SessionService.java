package com.mischievous.fairies.service;

import com.mischievous.fairies.model.entity.SessionEntity;
import com.mischievous.fairies.model.entity.UserEntity;
import com.mischievous.fairies.repository.SessionRepository;
import com.mischievous.fairies.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    public SessionService(SessionRepository sessionRepository, UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    public void startSession(Long userId) {
        Optional<UserEntity> userEntityOptional = userRepository.findById(userId);
        UserEntity userEntity = userEntityOptional.get();

        SessionEntity sessionEntity = new SessionEntity();
        sessionEntity.setUser(userEntity);
    }


    public Page<SessionEntity> getUserSessions(Long userId, Pageable pageable) {
        return sessionRepository.findByUser_Id(userId, pageable);
    }


    @Transactional
    public void endSession(Long sessionId) {
        sessionRepository.deleteById(sessionId);
    }
}
