package com.mischievous.fairies.model.dto.req;

import lombok.Data;

import java.util.List;

@Data
public class CreateCheckPointReqDto {
    private Long sessionId;
    private List<WebActivityDto> webActivities;
    private String description;
}
