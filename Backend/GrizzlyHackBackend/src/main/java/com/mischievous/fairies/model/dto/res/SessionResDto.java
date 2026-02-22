package com.mischievous.fairies.model.dto.res;

import lombok.Data;

import java.time.Instant;

@Data
public class SessionResDto {
    private Long id;
    private Instant sessionStart;
    private Instant sessionEnd;
}

