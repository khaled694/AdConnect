package com.khaled.adconnect.service;

import com.khaled.adconnect.dto.CooperationRequestRequest;
import com.khaled.adconnect.dto.CooperationRequestResponse;
import com.khaled.adconnect.enums.RequestStatus;
import com.khaled.adconnect.exception.ResourceNotFoundException;
import com.khaled.adconnect.model.Campaign;
import com.khaled.adconnect.model.CooperationRequest;
import com.khaled.adconnect.model.YouTuberProfile;
import com.khaled.adconnect.repository.CampaignRepository;
import com.khaled.adconnect.repository.CooperationRequestRepository;
import com.khaled.adconnect.repository.YouTuberProfileRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CooperationRequestService {

    private final CooperationRequestRepository cooperationRequestRepository;
    private final CampaignRepository campaignRepository;
    private final YouTuberProfileRepository youTuberProfileRepository;

    public List<CooperationRequestResponse> getAllRequests() {
        return cooperationRequestRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CooperationRequestResponse getRequestById(Long id) {
        CooperationRequest cooperationRequest = findRequestById(id);
        return toResponse(cooperationRequest);
    }

    public CooperationRequestResponse createRequest(CooperationRequestRequest request) {
        CooperationRequest cooperationRequest = new CooperationRequest();
        updateRequestFromRequest(cooperationRequest, request);
        cooperationRequest.setStatus(RequestStatus.PENDING);

        return toResponse(cooperationRequestRepository.save(cooperationRequest));
    }

    public List<CooperationRequestResponse> getRequestsByCampaign(Long campaignId) {
        findCampaignById(campaignId);

        return cooperationRequestRepository.findByCampaign_Id(campaignId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CooperationRequestResponse> getRequestsByYoutuber(Long youtuberProfileId) {
        findYoutuberProfileById(youtuberProfileId);

        return cooperationRequestRepository.findByYoutuberProfile_Id(youtuberProfileId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CooperationRequestResponse acceptRequest(Long id) {
        CooperationRequest cooperationRequest = findRequestById(id);
        cooperationRequest.setStatus(RequestStatus.ACCEPTED);

        return toResponse(cooperationRequestRepository.save(cooperationRequest));
    }

    public CooperationRequestResponse rejectRequest(Long id) {
        CooperationRequest cooperationRequest = findRequestById(id);
        cooperationRequest.setStatus(RequestStatus.REJECTED);

        return toResponse(cooperationRequestRepository.save(cooperationRequest));
    }

    private CooperationRequest findRequestById(Long id) {
        return cooperationRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cooperation request with id " + id + " was not found."));
    }

    private Campaign findCampaignById(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign with id " + id + " was not found."));
    }

    private YouTuberProfile findYoutuberProfileById(Long id) {
        return youTuberProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("YouTuber profile with id " + id + " was not found."));
    }

    private void updateRequestFromRequest(CooperationRequest cooperationRequest, CooperationRequestRequest request) {
        cooperationRequest.setCampaign(findCampaignById(request.getCampaignId()));
        cooperationRequest.setYoutuberProfile(findYoutuberProfileById(request.getYoutuberProfileId()));
        cooperationRequest.setMessage(request.getMessage());
        cooperationRequest.setOfferedPrice(request.getOfferedPrice());
    }

    private CooperationRequestResponse toResponse(CooperationRequest cooperationRequest) {
        Campaign campaign = cooperationRequest.getCampaign();
        YouTuberProfile youtuberProfile = cooperationRequest.getYoutuberProfile();

        return new CooperationRequestResponse(
                cooperationRequest.getId(),
                campaign == null ? null : campaign.getId(),
                campaign == null ? null : campaign.getTitle(),
                youtuberProfile == null ? null : youtuberProfile.getId(),
                youtuberProfile == null ? null : youtuberProfile.getChannelName(),
                cooperationRequest.getMessage(),
                cooperationRequest.getOfferedPrice(),
                cooperationRequest.getStatus(),
                cooperationRequest.getCreatedAt()
        );
    }
}
