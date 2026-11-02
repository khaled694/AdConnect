package com.khaled.adconnect.dto;

import com.khaled.adconnect.enums.Role;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;

    private String username;

    private String email;

    private Role role;

    private LocalDateTime createdAt;
}
