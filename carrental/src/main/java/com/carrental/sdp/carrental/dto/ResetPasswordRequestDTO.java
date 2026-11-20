package com.carrental.sdp.carrental.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequestDTO {
    @NotBlank
    private String token;

    @NotBlank
    @Size(min = 6, max = 100, message = "must be between 6 and 100 characters")
    private String newPassword;
}
