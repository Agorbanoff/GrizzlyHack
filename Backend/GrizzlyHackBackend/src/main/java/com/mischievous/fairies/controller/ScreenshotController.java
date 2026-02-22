package com.mischievous.fairies.controller;

import com.mischievous.fairies.model.dto.req.CheckPointReqDto;
import com.mischievous.fairies.model.entity.ScreenshotEntity;
import com.mischievous.fairies.service.CheckpointService;
import com.mischievous.fairies.service.JwtService;
import com.mischievous.fairies.service.ScreenshotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/screenshots")
public class ScreenshotController {
    private final ScreenshotService screenshotService;
    private final JwtService jwtService;
    private final CheckpointService checkpointService;

    @Autowired
    public ScreenshotController(ScreenshotService screenshotService, JwtService jwtService, CheckpointService checkpointService) {
        this.screenshotService = screenshotService;
        this.jwtService = jwtService;
        this.checkpointService = checkpointService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Void> saveScreenshot(@CookieValue(name = "access_token") String jwt,
                                               @RequestParam(value = "file") MultipartFile file,
                                               @RequestParam(value = "checkpoint_id") Long checkpointId) {
        try {
            Long userId = jwtService.extractUserData(jwt).getId();
            screenshotService.saveScreenshot(userId, file, checkpointId);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenshotEntity> getScreenshot(@PathVariable(name = "id") Long id,
                                                          @CookieValue(name = "access_token") String jwt) {
        try {
            Optional<ScreenshotEntity> opt = screenshotService.getScreenshot(id, jwtService.extractUserData(jwt).getId());
            return opt.map(s -> ResponseEntity.status(HttpStatus.OK).body(s))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScreenshot(@PathVariable(name = "id") Long id,
                                                 @CookieValue(name = "access_token") String jwt) {
        try {
            screenshotService.deleteScreenshot(id, jwtService.extractUserData(jwt).getId());
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
