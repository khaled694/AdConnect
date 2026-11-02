package com.khaled.adconnect.dto;

import com.khaled.adconnect.enums.RequestStatus;
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
public class CooperationRequestResponse {

    private Long id;

    private Long campaignId;

    private String campaignTitle;

    private Long youtuberProfileId;

    private String channelName;

    private String message;

    private BigDecimal offeredPrice;

    private RequestStatus status;

    private LocalDateTime createdAt;
}
