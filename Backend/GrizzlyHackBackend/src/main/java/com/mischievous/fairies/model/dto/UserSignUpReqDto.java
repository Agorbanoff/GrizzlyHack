package com.mischievous.fairies.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserSignUpReqDto {
    @NotBlank
    private String username;
    @NotBlank
    private String password;
}
