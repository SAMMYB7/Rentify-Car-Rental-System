package com.carrental.sdp.carrental.dto;

import com.carrental.sdp.carrental.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/** Body for PATCH /api/users/{id}/role. */
@Getter
@Setter
public class RoleUpdateRequest {
    @NotNull
    private Role role;
}
