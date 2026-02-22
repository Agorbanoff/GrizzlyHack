package com.mischievous.fairies.model.dto.res;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WebActivityAnalysisDto {
    private String host;
    private Long totalTime;
}
