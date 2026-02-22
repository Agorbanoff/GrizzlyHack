package com.mischievous.fairies.controller;

import com.mischievous.fairies.model.dto.req.WebActivityDto;
import com.mischievous.fairies.model.dto.res.PagedResponse;
import com.mischievous.fairies.model.dto.res.SessionAnalysisDto;
import com.mischievous.fairies.model.dto.res.SessionResDto;
import com.mischievous.fairies.model.dto.res.WebActivityAnalysisDto;
import com.mischievous.fairies.service.AnalysisService;
import com.mischievous.fairies.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/analysis")
public class AnalysisController {
    private final AnalysisService analysisService;
    private final JwtService jwtService;

    @Autowired
    public AnalysisController(AnalysisService analysisService, JwtService jwtService) {
        this.analysisService = analysisService;
        this.jwtService = jwtService;
    }

    @GetMapping("/sessions/longest")
    public ResponseEntity<PagedResponse<SessionAnalysisDto>> getSessionsLongest(
                @PageableDefault(size = 20, sort = "id") Pageable pageable,
                @CookieValue(name = "access_token") String jwt) {
         PagedResponse<SessionAnalysisDto> pagedResponse =
                 analysisService.getLongestSessions(jwtService.extractUserData(jwt).getId(), pageable);
            return ResponseEntity.status(HttpStatus.OK).body(pagedResponse);
    }

    @GetMapping("/web-activities/most-time-spent")
    public ResponseEntity<List<WebActivityAnalysisDto>> getWebActivitiesMostTimeSpent(@CookieValue(name = "access_token") String jwt) {
         return ResponseEntity
                 .status(HttpStatus.OK)
                 .body(analysisService.getWebActivitiesMostTimeSpent(jwtService.extractUserData(jwt).getId())) ;
    }
}
