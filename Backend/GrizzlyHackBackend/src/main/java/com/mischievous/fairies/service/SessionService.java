package com.mischievous.fairies.service;

import com.mischievous.fairies.model.entity.SessionEntity;
import com.mischievous.fairies.model.entity.UserEntity;
import com.mischievous.fairies.repository.SessionRepository;
import com.mischievous.fairies.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class SessionService {
    private SessionRepository sessionRepository;
    private  UserRepository userRepository;
    @Autowired
    public void setSessionRepository(SessionRepository sessionRepository,
                                     UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    public void startSession(Long userId) {
        Optional<UserEntity> userEntityOptional = userRepository.findById(userId);
        UserEntity userEntity = userEntityOptional.get();

        SessionEntity sessionEntity = new SessionEntity();
        sessionEntity.setUser(userEntity);
    }

    @Transactional
    public void endSession(Long sessionId) {
        sessionRepository.deleteById(sessionId);
    }
}
