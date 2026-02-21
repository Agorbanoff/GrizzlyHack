package com.mischievous.fairies.controller;

import com.mischievous.fairies.service.JwtService;
import com.mischievous.fairies.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sessions")
public class SessionController {

    private final SessionService sessionService;
    private final JwtService jwtService;
    @Autowired
    public SessionController(SessionService sessionService, JwtService jwtService) {
        this.sessionService = sessionService;
        this.jwtService = jwtService;
    }
    @PostMapping("/start")
    public ResponseEntity<Void> createSession(@CookieValue(name = "userToken") String userToken) {
        sessionService.startSession(jwtService.extractUserData(userToken).getId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/end")
    public ResponseEntity<Void> endSession(@CookieValue(name = "userToken") String userToken) {
        sessionService.endSession(jwtService.extractUserData(userToken).getId());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
