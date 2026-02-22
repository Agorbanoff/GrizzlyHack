package com.mischievous.fairies.controller;

import com.mischievous.fairies.model.dto.req.CreateCheckPointReqDto;
import com.mischievous.fairies.model.dto.res.GetCheckpointResDto;
import com.mischievous.fairies.model.dto.res.CreateCheckpointResDto;
import com.mischievous.fairies.model.dto.res.PagedResponse;
import com.mischievous.fairies.service.CheckpointService;
import com.mischievous.fairies.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/checkpoints")
public class CheckpointController {
    private final CheckpointService checkpointService;
    private final JwtService jwtService;

    @Autowired
    public CheckpointController(CheckpointService checkpointService, JwtService jwtService) {
        this.checkpointService = checkpointService;
        this.jwtService = jwtService;
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<CreateCheckpointResDto> createCheckpoint(@RequestBody CreateCheckPointReqDto createCheckPointReqDto,
                                                                   @CookieValue(name = "access_token") String jwt) {
        try {
            Long checkpointId = checkpointService.createCheckpoint(createCheckPointReqDto, jwtService.extractUserData(jwt).getId());
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(new CreateCheckpointResDto("Checkpoint created successfully", checkpointId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<PagedResponse<GetCheckpointResDto>> getCheckpointsForSession(@PathVariable(name = "sessionId") Long sessionId,
                                                                                       @CookieValue(name = "access_token") String jwt,
                                                                                       @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        try {
            PagedResponse<GetCheckpointResDto> pagedResponse =
                    checkpointService.getCheckpointsForSession(sessionId, jwtService.extractUserData(jwt).getId(), pageable);
            return ResponseEntity.status(HttpStatus.OK).body(pagedResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCheckpoint(@PathVariable("id") Long id,
                                                 @CookieValue(name = "access_token") String jwt) {
        try {
            checkpointService.deleteCheckpoint(id, jwtService.extractUserData(jwt).getId());
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
