package com.khaled.adconnect.service;

import com.khaled.adconnect.dto.CampaignRequest;
import com.khaled.adconnect.dto.CampaignResponse;
import com.khaled.adconnect.exception.ResourceNotFoundException;
import com.khaled.adconnect.model.Campaign;
import com.khaled.adconnect.model.Category;
import com.khaled.adconnect.model.CompanyProfile;
import com.khaled.adconnect.repository.CampaignRepository;
import com.khaled.adconnect.repository.CategoryRepository;
import com.khaled.adconnect.repository.CompanyProfileRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final CategoryRepository categoryRepository;

    public List<CampaignResponse> getAllCampaigns() {
        return campaignRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CampaignResponse getCampaignById(Long id) {
        Campaign campaign = findCampaignById(id);
        return toResponse(campaign);
    }

    public CampaignResponse createCampaign(CampaignRequest request) {
        Campaign campaign = new Campaign();
        updateCampaignFromRequest(campaign, request);

        return toResponse(campaignRepository.save(campaign));
    }

    public CampaignResponse updateCampaign(Long id, CampaignRequest request) {
        Campaign campaign = findCampaignById(id);
        updateCampaignFromRequest(campaign, request);

        return toResponse(campaignRepository.save(campaign));
    }

    public void deleteCampaign(Long id) {
        Campaign campaign = findCampaignById(id);
        campaignRepository.delete(campaign);
    }

    public List<CampaignResponse> getCampaignsByCompany(Long companyProfileId) {
        findCompanyProfileById(companyProfileId);

        return campaignRepository.findByCompanyProfile_Id(companyProfileId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CampaignResponse> getCampaignsByCategory(String categoryName) {
        return campaignRepository.findByTargetCategory_Name(categoryName)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Campaign findCampaignById(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign with id " + id + " was not found."));
    }

    private CompanyProfile findCompanyProfileById(Long id) {
        return companyProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company profile with id " + id + " was not found."));
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category with id " + id + " was not found."));
    }

    private void updateCampaignFromRequest(Campaign campaign, CampaignRequest request) {
        campaign.setCompanyProfile(findCompanyProfileById(request.getCompanyProfileId()));
        campaign.setTargetCategory(request.getTargetCategoryId() == null ? null : findCategoryById(request.getTargetCategoryId()));
        campaign.setTitle(request.getTitle());
        campaign.setDescription(request.getDescription());
        campaign.setCampaignType(request.getCampaignType());
        campaign.setBudget(request.getBudget());
        campaign.setDeadline(request.getDeadline());
    }

    private CampaignResponse toResponse(Campaign campaign) {
        CompanyProfile companyProfile = campaign.getCompanyProfile();
        Category targetCategory = campaign.getTargetCategory();

        return new CampaignResponse(
                campaign.getId(),
                companyProfile == null ? null : companyProfile.getId(),
                companyProfile == null ? null : companyProfile.getCompanyName(),
                targetCategory == null ? null : targetCategory.getId(),
                targetCategory == null ? null : targetCategory.getName(),
                campaign.getTitle(),
                campaign.getDescription(),
                campaign.getCampaignType(),
                campaign.getBudget(),
                campaign.getDeadline(),
                campaign.getCreatedAt()
        );
    }
}
