package com.mischievous.fairies.model.dto.res;

import lombok.Data;

import java.time.Instant;

@Data
public class GetCheckpointResDto {
    private Long id;
    private String url;
    private Instant timestamp;
}

