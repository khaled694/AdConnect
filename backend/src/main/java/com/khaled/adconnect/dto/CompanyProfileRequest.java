package com.khaled.adconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompanyProfileRequest {

    @NotNull
    private Long userId;

    @NotBlank
    private String companyName;

    private String industry;

    private String website;

    private String description;

    private String contactEmail;
}
