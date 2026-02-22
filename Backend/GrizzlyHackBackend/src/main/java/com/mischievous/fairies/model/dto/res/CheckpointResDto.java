package com.mischievous.fairies.model.dto.res;

import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class CheckpointResDto {
    private Long id;
    private String url;
    private Instant timestamp;
}

