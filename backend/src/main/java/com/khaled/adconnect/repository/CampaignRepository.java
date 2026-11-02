package com.khaled.adconnect.repository;

import com.khaled.adconnect.model.Campaign;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    List<Campaign> findByCompanyProfile_Id(Long companyProfileId);

    List<Campaign> findByTargetCategory_Name(String categoryName);
}
