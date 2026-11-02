package com.khaled.adconnect.repository;

import com.khaled.adconnect.model.CompanyProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, Long> {

    Optional<CompanyProfile> findByUser_Id(Long userId);
}
