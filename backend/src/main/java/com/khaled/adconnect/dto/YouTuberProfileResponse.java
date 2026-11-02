package com.khaled.adconnect.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class YouTuberProfileResponse {

    private Long id;

    private Long userId;

    private String username;

    private Long categoryId;

    private String categoryName;

    private String channelName;

    private String youtubeUrl;

    private String description;

    private String country;

    private String language;

    private Integer subscribersCount;

    private Integer averageViews;

    private BigDecimal pricePerAd;

    private String contactEmail;

    private LocalDateTime createdAt;
}
