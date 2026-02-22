package com.mischievous.fairies.model.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserLoginReqDto {
    @NotBlank
    private String username;
    @NotBlank
    private String password;
}
