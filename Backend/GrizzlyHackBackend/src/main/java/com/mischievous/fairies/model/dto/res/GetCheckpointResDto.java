package com.mischievous.fairies.model.dto.res;

import com.mischievous.fairies.model.dto.req.WebActivityDto;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class GetCheckpointResDto {
    private Long id;
    private List<WebActivityDto> webActivities;
    private String description;
    private Instant timestamp;
}

