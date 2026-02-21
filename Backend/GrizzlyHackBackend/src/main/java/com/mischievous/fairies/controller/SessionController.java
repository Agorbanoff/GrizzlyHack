package com.mischievous.fairies.controller;

import com.mischievous.fairies.model.entity.SessionEntity;
import com.mischievous.fairies.service.JwtService;
import com.mischievous.fairies.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/sessions")
public class SessionController {

    private final SessionService sessionService;
    private final JwtService jwtService;

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

    @GetMapping("/{id}")
    public ResponseEntity<Page<SessionEntity>> getAllSessions(@PathVariable("id") Long id, @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(sessionService.getUserSessions(id, pageable));
    }
}
