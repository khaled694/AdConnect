package com.khaled.adconnect.controller;

import com.khaled.adconnect.dto.CompanyProfileRequest;
import com.khaled.adconnect.dto.CompanyProfileResponse;
import com.khaled.adconnect.service.CompanyProfileService;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyProfileController {

    private final CompanyProfileService companyProfileService;

    @GetMapping
    public ResponseEntity<List<CompanyProfileResponse>> getAllCompanies() {
        return ResponseEntity.ok(companyProfileService.getAllCompanies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyProfileResponse> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyProfileService.getCompanyById(id));
    }

    @PostMapping
    public ResponseEntity<CompanyProfileResponse> createCompany(
            @Valid @RequestBody CompanyProfileRequest request
    ) {
        return ResponseEntity.ok(companyProfileService.createCompany(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyProfileResponse> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody CompanyProfileRequest request
    ) {
        return ResponseEntity.ok(companyProfileService.updateCompany(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyProfileService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}
