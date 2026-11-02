package com.khaled.adconnect.controller;

import com.khaled.adconnect.dto.YouTuberProfileRequest;
import com.khaled.adconnect.dto.YouTuberProfileResponse;
import com.khaled.adconnect.service.YouTuberProfileService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/youtubers")
@RequiredArgsConstructor
public class YouTuberProfileController {

    private final YouTuberProfileService youTuberProfileService;

    @GetMapping
    public ResponseEntity<List<YouTuberProfileResponse>> getAllProfiles() {
        return ResponseEntity.ok(youTuberProfileService.getAllProfiles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<YouTuberProfileResponse> getProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(youTuberProfileService.getProfileById(id));
    }

    @PostMapping
    public ResponseEntity<YouTuberProfileResponse> createProfile(
            @Valid @RequestBody YouTuberProfileRequest request
    ) {
        return ResponseEntity.ok(youTuberProfileService.createProfile(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<YouTuberProfileResponse> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody YouTuberProfileRequest request
    ) {
        return ResponseEntity.ok(youTuberProfileService.updateProfile(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(@PathVariable Long id) {
        youTuberProfileService.deleteProfile(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<YouTuberProfileResponse>> searchProfiles(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Integer minSubscribers,
            @RequestParam(required = false) Integer minAverageViews,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        return ResponseEntity.ok(youTuberProfileService.searchProfiles(
                category,
                country,
                language,
                minSubscribers,
                minAverageViews,
                maxPrice
        ));
    }
}
