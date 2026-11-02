package com.khaled.adconnect.repository;

import com.khaled.adconnect.enums.RequestStatus;
import com.khaled.adconnect.model.CooperationRequest;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CooperationRequestRepository extends JpaRepository<CooperationRequest, Long> {

    List<CooperationRequest> findByCampaign_Id(Long campaignId);

    List<CooperationRequest> findByYoutuberProfile_Id(Long youtuberProfileId);

    List<CooperationRequest> findByStatus(RequestStatus status);
}
