package com.khaled.adconnect.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    private String campaignType;

    private BigDecimal budget;

    private LocalDate deadline;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "company_profile_id", nullable = false)
    @JsonBackReference("company-campaigns")
    private CompanyProfile companyProfile;

    @ManyToOne
    @JoinColumn(name = "target_category_id")
    @JsonBackReference("category-campaigns")
    private Category targetCategory;

    @OneToMany(mappedBy = "campaign")
    @JsonManagedReference("campaign-requests")
    private List<CooperationRequest> cooperationRequests = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
