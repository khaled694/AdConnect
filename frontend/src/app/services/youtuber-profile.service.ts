import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { YoutuberProfile } from '../models/youtuber-profile.model';
import { YoutuberProfileRequest } from '../models/youtuber-profile-request.model';

export interface YoutuberProfileSearchFilters {
  category: string;
  country: string;
  language: string;
  minSubscribers: number | null;
  minAverageViews: number | null;
  maxPrice: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class YoutuberProfileService {
  private readonly apiUrl = 'http://localhost:8080/api/youtubers';

  constructor(private readonly http: HttpClient) {}

  getAllProfiles(): Observable<YoutuberProfile[]> {
    return this.http.get<YoutuberProfile[]>(this.apiUrl);
  }

  getProfileById(id: number): Observable<YoutuberProfile> {
    return this.http.get<YoutuberProfile>(`${this.apiUrl}/${id}`);
  }

  createProfile(request: YoutuberProfileRequest): Observable<YoutuberProfile> {
    return this.http.post<YoutuberProfile>(this.apiUrl, request);
  }

  updateProfile(id: number, request: YoutuberProfileRequest): Observable<YoutuberProfile> {
    return this.http.put<YoutuberProfile>(`${this.apiUrl}/${id}`, request);
  }

  searchProfiles(filters: YoutuberProfileSearchFilters): Observable<YoutuberProfile[]> {
    return this.http.get<YoutuberProfile[]>(`${this.apiUrl}/search`, {
      params: this.buildSearchParams(filters)
    });
  }

  private buildSearchParams(filters: YoutuberProfileSearchFilters): HttpParams {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return params;
  }
}
