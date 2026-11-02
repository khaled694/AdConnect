package com.khaled.adconnect.service;

import com.khaled.adconnect.dto.YouTuberProfileRequest;
import com.khaled.adconnect.dto.YouTuberProfileResponse;
import com.khaled.adconnect.enums.Role;
import com.khaled.adconnect.exception.BadRequestException;
import com.khaled.adconnect.exception.ConflictException;
import com.khaled.adconnect.exception.ResourceNotFoundException;
import com.khaled.adconnect.model.Category;
import com.khaled.adconnect.model.User;
import com.khaled.adconnect.model.YouTuberProfile;
import com.khaled.adconnect.repository.CategoryRepository;
import com.khaled.adconnect.repository.UserRepository;
import com.khaled.adconnect.repository.YouTuberProfileRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class YouTuberProfileService {

    private final YouTuberProfileRepository youTuberProfileRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public List<YouTuberProfileResponse> getAllProfiles() {
        return youTuberProfileRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public YouTuberProfileResponse getProfileById(Long id) {
        YouTuberProfile profile = findProfileById(id);
        return toResponse(profile);
    }

    public YouTuberProfileResponse createProfile(YouTuberProfileRequest request) {
        User user = findUserById(request.getUserId());
        validateYouTuberUser(user);

        if (user.getYouTuberProfile() != null) {
            throw new ConflictException("User with id " + request.getUserId() + " already has a YouTuber profile.");
        }

        YouTuberProfile profile = new YouTuberProfile();
        profile.setUser(user);
        updateProfileFromRequest(profile, request);

        return toResponse(youTuberProfileRepository.save(profile));
    }

    public YouTuberProfileResponse updateProfile(Long id, YouTuberProfileRequest request) {
        YouTuberProfile profile = findProfileById(id);
        User user = findUserById(request.getUserId());
        validateYouTuberUser(user);

        if (user.getYouTuberProfile() != null && !user.getYouTuberProfile().getId().equals(id)) {
            throw new ConflictException("User with id " + request.getUserId() + " already has a YouTuber profile.");
        }

        profile.setUser(user);
        updateProfileFromRequest(profile, request);

        return toResponse(youTuberProfileRepository.save(profile));
    }

    public void deleteProfile(Long id) {
        YouTuberProfile profile = findProfileById(id);
        youTuberProfileRepository.delete(profile);
    }

    public List<YouTuberProfileResponse> searchProfiles(
            String category,
            String country,
            String language,
            Integer minSubscribers,
            Integer minAverageViews,
            BigDecimal maxPrice
    ) {
        return youTuberProfileRepository.findAll()
                .stream()
                .filter(profile -> matchesCategory(profile, category))
                .filter(profile -> matchesCountry(profile, country))
                .filter(profile -> matchesLanguage(profile, language))
                .filter(profile -> matchesMinSubscribers(profile, minSubscribers))
                .filter(profile -> matchesMinAverageViews(profile, minAverageViews))
                .filter(profile -> matchesMaxPrice(profile, maxPrice))
                .map(this::toResponse)
                .toList();
    }

    private YouTuberProfile findProfileById(Long id) {
        return youTuberProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("YouTuber profile with id " + id + " was not found."));
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + id + " was not found."));
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category with id " + id + " was not found."));
    }

    private void validateYouTuberUser(User user) {
        if (user.getRole() != Role.ROLE_YOUTUBER) {
            throw new BadRequestException("User must have role ROLE_YOUTUBER to create a YouTuber profile.");
        }
    }

    private void updateProfileFromRequest(YouTuberProfile profile, YouTuberProfileRequest request) {
        profile.setCategory(request.getCategoryId() == null ? null : findCategoryById(request.getCategoryId()));
        profile.setChannelName(request.getChannelName());
        profile.setYoutubeUrl(request.getYoutubeUrl());
        profile.setDescription(request.getDescription());
        profile.setCountry(request.getCountry());
        profile.setLanguage(request.getLanguage());
        profile.setSubscribersCount(request.getSubscribersCount());
        profile.setAverageViews(request.getAverageViews());
        profile.setPricePerAd(request.getPricePerAd());
        profile.setContactEmail(request.getContactEmail());
    }

    private YouTuberProfileResponse toResponse(YouTuberProfile profile) {
        User user = profile.getUser();
        Category category = profile.getCategory();

        return new YouTuberProfileResponse(
                profile.getId(),
                user == null ? null : user.getId(),
                user == null ? null : user.getUsername(),
                category == null ? null : category.getId(),
                category == null ? null : category.getName(),
                profile.getChannelName(),
                profile.getYoutubeUrl(),
                profile.getDescription(),
                profile.getCountry(),
                profile.getLanguage(),
                profile.getSubscribersCount(),
                profile.getAverageViews(),
                profile.getPricePerAd(),
                profile.getContactEmail(),
                profile.getCreatedAt()
        );
    }

    private boolean matchesCategory(YouTuberProfile profile, String category) {
        return isBlank(category)
                || (profile.getCategory() != null
                && profile.getCategory().getName() != null
                && profile.getCategory().getName().equalsIgnoreCase(category));
    }

    private boolean matchesCountry(YouTuberProfile profile, String country) {
        return isBlank(country)
                || (profile.getCountry() != null && profile.getCountry().equalsIgnoreCase(country));
    }

    private boolean matchesLanguage(YouTuberProfile profile, String language) {
        return isBlank(language)
                || (profile.getLanguage() != null && profile.getLanguage().equalsIgnoreCase(language));
    }

    private boolean matchesMinSubscribers(YouTuberProfile profile, Integer minSubscribers) {
        return minSubscribers == null
                || (profile.getSubscribersCount() != null && profile.getSubscribersCount() >= minSubscribers);
    }

    private boolean matchesMinAverageViews(YouTuberProfile profile, Integer minAverageViews) {
        return minAverageViews == null
                || (profile.getAverageViews() != null && profile.getAverageViews() >= minAverageViews);
    }

    private boolean matchesMaxPrice(YouTuberProfile profile, BigDecimal maxPrice) {
        return maxPrice == null
                || (profile.getPricePerAd() != null && profile.getPricePerAd().compareTo(maxPrice) <= 0);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
