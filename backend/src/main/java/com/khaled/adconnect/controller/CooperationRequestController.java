package com.khaled.adconnect.controller;

import com.khaled.adconnect.dto.CooperationRequestRequest;
import com.khaled.adconnect.dto.CooperationRequestResponse;
import com.khaled.adconnect.service.CooperationRequestService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class CooperationRequestController {

    private final CooperationRequestService cooperationRequestService;

    @GetMapping
    public ResponseEntity<List<CooperationRequestResponse>> getAllRequests() {
        return ResponseEntity.ok(cooperationRequestService.getAllRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CooperationRequestResponse> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(cooperationRequestService.getRequestById(id));
    }

    @PostMapping
    public ResponseEntity<CooperationRequestResponse> createRequest(
            @Valid @RequestBody CooperationRequestRequest request
    ) {
        return ResponseEntity.ok(cooperationRequestService.createRequest(request));
    }

    @GetMapping("/campaign/{campaignId}")
    public ResponseEntity<List<CooperationRequestResponse>> getRequestsByCampaign(@PathVariable Long campaignId) {
        return ResponseEntity.ok(cooperationRequestService.getRequestsByCampaign(campaignId));
    }

    @GetMapping("/youtuber/{youtuberProfileId}")
    public ResponseEntity<List<CooperationRequestResponse>> getRequestsByYoutuber(
            @PathVariable Long youtuberProfileId
    ) {
        return ResponseEntity.ok(cooperationRequestService.getRequestsByYoutuber(youtuberProfileId));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<CooperationRequestResponse> acceptRequest(@PathVariable Long id) {
        return ResponseEntity.ok(cooperationRequestService.acceptRequest(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<CooperationRequestResponse> rejectRequest(@PathVariable Long id) {
        return ResponseEntity.ok(cooperationRequestService.rejectRequest(id));
    }
}
