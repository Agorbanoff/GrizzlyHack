package com.mischievous.fairies.model.dto.res;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateCheckpointResDto {
    private String message;
    private Long checkpointId;
}
