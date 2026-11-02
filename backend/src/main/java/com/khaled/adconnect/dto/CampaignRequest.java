package com.khaled.adconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CampaignRequest {

    @NotNull
    private Long companyProfileId;

    private Long targetCategoryId;

    @NotBlank
    private String title;

    private String description;

    private String campaignType;

    private BigDecimal budget;

    private LocalDate deadline;
}
