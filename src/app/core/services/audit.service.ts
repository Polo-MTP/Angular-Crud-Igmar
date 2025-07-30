import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  AuditResponse, 
  AuditStatsResponse, 
  AuditFilters 
} from '../models/audit.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly API_URL = 'http://localhost:3333/api/audits';

  constructor(private http: HttpClient) {}

  getAudits(filters?: AuditFilters): Observable<AuditResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.userId) params = params.set('userId', filters.userId.toString());
      if (filters.entityType) params = params.set('entityType', filters.entityType);
      if (filters.entityId) params = params.set('entityId', filters.entityId.toString());
      if (filters.action) params = params.set('action', filters.action);
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<AuditResponse>(this.API_URL, { params });
  }

  getStats(): Observable<AuditStatsResponse> {
    return this.http.get<AuditStatsResponse>(`${this.API_URL}/stats`);
  }

  getMyAudits(page: number = 1, limit: number = 50): Observable<AuditResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<AuditResponse>(`${this.API_URL}/my-audits`, { params });
  }
}
