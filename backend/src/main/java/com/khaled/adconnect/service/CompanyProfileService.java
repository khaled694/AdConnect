package com.khaled.adconnect.service;

import com.khaled.adconnect.dto.CompanyProfileRequest;
import com.khaled.adconnect.dto.CompanyProfileResponse;
import com.khaled.adconnect.enums.Role;
import com.khaled.adconnect.exception.BadRequestException;
import com.khaled.adconnect.exception.ConflictException;
import com.khaled.adconnect.exception.ResourceNotFoundException;
import com.khaled.adconnect.model.CompanyProfile;
import com.khaled.adconnect.model.User;
import com.khaled.adconnect.repository.CompanyProfileRepository;
import com.khaled.adconnect.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompanyProfileService {

    private final CompanyProfileRepository companyProfileRepository;
    private final UserRepository userRepository;

    public List<CompanyProfileResponse> getAllCompanies() {
        return companyProfileRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CompanyProfileResponse getCompanyById(Long id) {
        CompanyProfile companyProfile = findCompanyProfileById(id);
        return toResponse(companyProfile);
    }

    public CompanyProfileResponse createCompany(CompanyProfileRequest request) {
        User user = findUserById(request.getUserId());
        validateCompanyUser(user);

        if (companyProfileRepository.findByUser_Id(request.getUserId()).isPresent()) {
            throw new ConflictException("User with id " + request.getUserId() + " already has a company profile.");
        }

        CompanyProfile companyProfile = new CompanyProfile();
        companyProfile.setUser(user);
        updateCompanyProfileFromRequest(companyProfile, request);

        return toResponse(companyProfileRepository.save(companyProfile));
    }

    public CompanyProfileResponse updateCompany(Long id, CompanyProfileRequest request) {
        CompanyProfile companyProfile = findCompanyProfileById(id);
        User user = findUserById(request.getUserId());
        validateCompanyUser(user);

        companyProfileRepository.findByUser_Id(request.getUserId())
                .ifPresent(existingProfile -> {
                    if (!existingProfile.getId().equals(id)) {
                        throw new ConflictException("User with id " + request.getUserId() + " already has a company profile.");
                    }
                });

        companyProfile.setUser(user);
        updateCompanyProfileFromRequest(companyProfile, request);

        return toResponse(companyProfileRepository.save(companyProfile));
    }

    public void deleteCompany(Long id) {
        CompanyProfile companyProfile = findCompanyProfileById(id);
        companyProfileRepository.delete(companyProfile);
    }

    private CompanyProfile findCompanyProfileById(Long id) {
        return companyProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company profile with id " + id + " was not found."));
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + id + " was not found."));
    }

    private void validateCompanyUser(User user) {
        if (user.getRole() != Role.ROLE_COMPANY) {
            throw new BadRequestException("User must have role ROLE_COMPANY to create a company profile.");
        }
    }

    private void updateCompanyProfileFromRequest(CompanyProfile companyProfile, CompanyProfileRequest request) {
        companyProfile.setCompanyName(request.getCompanyName());
        companyProfile.setIndustry(request.getIndustry());
        companyProfile.setWebsite(request.getWebsite());
        companyProfile.setDescription(request.getDescription());
        companyProfile.setContactEmail(request.getContactEmail());
    }

    private CompanyProfileResponse toResponse(CompanyProfile companyProfile) {
        User user = companyProfile.getUser();

        return new CompanyProfileResponse(
                companyProfile.getId(),
                user == null ? null : user.getId(),
                user == null ? null : user.getUsername(),
                companyProfile.getCompanyName(),
                companyProfile.getIndustry(),
                companyProfile.getWebsite(),
                companyProfile.getDescription(),
                companyProfile.getContactEmail(),
                companyProfile.getCreatedAt()
        );
    }
}
