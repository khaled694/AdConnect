import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Campaign } from '../models/campaign.model';
import { CampaignRequest } from '../models/campaign-request.model';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private readonly apiUrl = 'http://localhost:8080/api/campaigns';

  constructor(private readonly http: HttpClient) {}

  getAllCampaigns(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(this.apiUrl);
  }

  getCampaignsByCompany(companyProfileId: number): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(`${this.apiUrl}/company/${companyProfileId}`);
  }

  createCampaign(request: CampaignRequest): Observable<Campaign> {
    return this.http.post<Campaign>(this.apiUrl, request);
  }

  updateCampaign(id: number, request: CampaignRequest): Observable<Campaign> {
    return this.http.put<Campaign>(`${this.apiUrl}/${id}`, request);
  }

  deleteCampaign(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
