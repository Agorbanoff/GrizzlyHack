package com.mischievous.fairies.model.dto.req;

import lombok.Data;

@Data
public class WebActivityDto {
    private String title;
    private String host;
    private String url;
    private Long timeSpentMillis;
}
