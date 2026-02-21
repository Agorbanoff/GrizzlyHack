package com.mischievous.fairies.controller;

import com.mischievous.fairies.service.JwtService;
import com.mischievous.fairies.service.ScreenshotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/screenshots")
public class ScreenshotController {
    private final ScreenshotService screenshotService;
    private final JwtService jwtService;

    @Autowired
    public ScreenshotController(ScreenshotService screenshotService, JwtService jwtService) {
        this.screenshotService = screenshotService;
        this.jwtService = jwtService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Void> saveScreenshot(@CookieValue(name = "userToken") String userToken,
                                         @RequestParam("file") MultipartFile file,
                                         @RequestParam("checkpoint_id") Long checkpointId) {
        try {
            screenshotService.saveScreenshot(jwtService.extractUserData(userToken).getId(),
                    file,
                    checkpointId);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
