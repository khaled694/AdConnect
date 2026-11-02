package com.khaled.adconnect.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompanyProfileResponse {

    private Long id;

    private Long userId;

    private String username;

    private String companyName;

    private String industry;

    private String website;

    private String description;

    private String contactEmail;

    private LocalDateTime createdAt;
}
