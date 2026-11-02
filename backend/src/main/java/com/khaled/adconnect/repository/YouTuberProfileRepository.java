package com.khaled.adconnect.repository;

import com.khaled.adconnect.model.YouTuberProfile;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface YouTuberProfileRepository extends JpaRepository<YouTuberProfile, Long> {

    List<YouTuberProfile> findByCategory_Name(String categoryName);

    List<YouTuberProfile> findByCountryIgnoreCase(String country);

    List<YouTuberProfile> findByLanguageIgnoreCase(String language);
}
