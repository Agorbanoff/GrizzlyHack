package com.mischievous.fairies.model.dto.req;

import lombok.Data;

import java.util.List;

@Data
public class CheckPointReqDto {
    private Long sessionId;
    private String url;
}
