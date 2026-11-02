package com.khaled.adconnect.dto;

import com.khaled.adconnect.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;

    private Long id;

    private String username;

    private String email;

    private Role role;
}
