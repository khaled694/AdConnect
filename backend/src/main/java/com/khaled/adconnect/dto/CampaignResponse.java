package com.khaled.adconnect.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CampaignResponse {

    private Long id;

    private Long companyProfileId;

    private String companyName;

    private Long targetCategoryId;

    private String targetCategoryName;

    private String title;

    private String description;

    private String campaignType;

    private BigDecimal budget;

    private LocalDate deadline;

    private LocalDateTime createdAt;
}
