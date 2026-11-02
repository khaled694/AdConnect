package com.khaled.adconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class YouTuberProfileRequest {

    @NotNull
    private Long userId;

    private Long categoryId;

    @NotBlank
    private String channelName;

    @NotBlank
    private String youtubeUrl;

    private String description;

    private String country;

    private String language;

    private Integer subscribersCount;

    private Integer averageViews;

    private BigDecimal pricePerAd;

    private String contactEmail;
}
