package com.mischievous.fairies.model.dto.req;

import lombok.Data;

@Data
public class CreateCheckPointReqDto {
    private Long sessionId;
    private String title;
    private String url;
    private String description;
}
