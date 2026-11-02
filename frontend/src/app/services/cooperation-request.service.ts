import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CooperationRequest } from '../models/cooperation-request.model';
import { CooperationRequestRequest } from '../models/cooperation-request-request.model';

@Injectable({
  providedIn: 'root'
})
export class CooperationRequestService {
  private readonly apiUrl = 'http://localhost:8080/api/requests';

  constructor(private readonly http: HttpClient) {}

  getAllRequests(): Observable<CooperationRequest[]> {
    return this.http.get<CooperationRequest[]>(this.apiUrl);
  }

  createRequest(request: CooperationRequestRequest): Observable<CooperationRequest> {
    return this.http.post<CooperationRequest>(this.apiUrl, request);
  }

  getRequestsByCampaign(campaignId: number): Observable<CooperationRequest[]> {
    return this.http.get<CooperationRequest[]>(`${this.apiUrl}/campaign/${campaignId}`);
  }

  getRequestsByYoutuber(youtuberProfileId: number): Observable<CooperationRequest[]> {
    return this.http.get<CooperationRequest[]>(`${this.apiUrl}/youtuber/${youtuberProfileId}`);
  }

  acceptRequest(id: number): Observable<CooperationRequest> {
    return this.http.put<CooperationRequest>(`${this.apiUrl}/${id}/accept`, {});
  }

  rejectRequest(id: number): Observable<CooperationRequest> {
    return this.http.put<CooperationRequest>(`${this.apiUrl}/${id}/reject`, {});
  }
}
