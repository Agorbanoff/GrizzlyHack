package com.mischievous.fairies.model.dto.res;

import lombok.Data;

import java.time.Instant;

@Data
public class SessionAnalysisDto {
    private Long id;
    private Instant sessionStart;
    private Instant sessionEnd;
    private Long totalTime;
}
