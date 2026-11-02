import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CompanyProfile } from '../models/company-profile.model';
import { CompanyProfileRequest } from '../models/company-profile-request.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyProfileService {
  private readonly apiUrl = 'http://localhost:8080/api/companies';

  constructor(private readonly http: HttpClient) {}

  getAllCompanies(): Observable<CompanyProfile[]> {
    return this.http.get<CompanyProfile[]>(this.apiUrl);
  }

  createCompany(request: CompanyProfileRequest): Observable<CompanyProfile> {
    return this.http.post<CompanyProfile>(this.apiUrl, request);
  }

  updateCompany(id: number, request: CompanyProfileRequest): Observable<CompanyProfile> {
    return this.http.put<CompanyProfile>(`${this.apiUrl}/${id}`, request);
  }
}
