package com.mischievous.fairies.controller;

import com.mischievous.fairies.common.exception.CustomException;
import com.mischievous.fairies.model.dto.res.PagedResponse;
import com.mischievous.fairies.model.dto.res.SessionResDto;
import com.mischievous.fairies.model.entity.SessionEntity;
import com.mischievous.fairies.service.JwtService;
import com.mischievous.fairies.service.SessionService;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;

import java.util.List;

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
    public ResponseEntity<Void> createSession(@CookieValue(name = "access_token") String jwt) {
        sessionService.startSession(jwtService.extractUserData(jwt).getId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/end")
    public ResponseEntity<Void> endSession(@CookieValue(name = "access_token") String jwt) {
        sessionService.endSession(jwtService.extractUserData(jwt).getId());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Void> keepAlive(@PathVariable("id") Long id) {
        sessionService.keepAlive(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping()
    public ResponseEntity<PagedResponse<SessionResDto>> getAllSessions(@CookieValue(name = "access_token") String jwt,
                                                                       @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Long userId = jwtService.extractUserData(jwt).getId();
        PagedResponse<SessionResDto> pagedResponse = sessionService.getUserSessions(userId, pageable);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(pagedResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable("id") Long sessionId, @CookieValue(name = "access_token") String jwt) throws CustomException {
        Long requesterId = jwtService.extractUserData(jwt).getId();
        sessionService.deleteSession(sessionId, requesterId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
