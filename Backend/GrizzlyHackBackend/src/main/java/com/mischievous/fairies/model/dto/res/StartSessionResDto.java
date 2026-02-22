package com.mischievous.fairies.model.dto.res;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StartSessionResDto {
    private String message;
    private Long sessionId;
}
