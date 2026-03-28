package com.taskmanager.dto.response;

import com.taskmanager.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String tokenType;
    private Long userId;
    private String name;
    private String email;
    private Role role;
}
