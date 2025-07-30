import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Persona,
  CreatePersonaRequest,
  UpdatePersonaRequest,
} from '../models/persona.model';
import { ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class PersonaService {
  private readonly API_URL = 'http://localhost:3333/api/personas';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Persona[]>> {
    return this.http.get<ApiResponse<Persona[]>>(this.API_URL);
  }

  getById(id: number): Observable<ApiResponse<Persona>> {
    return this.http.get<ApiResponse<Persona>>(`${this.API_URL}/${id}`);
  }

  create(persona: CreatePersonaRequest): Observable<ApiResponse<Persona>> {
    return this.http.post<ApiResponse<Persona>>(this.API_URL, persona);
  }

  update(
    id: number,
    persona: UpdatePersonaRequest
  ): Observable<ApiResponse<Persona>> {
    return this.http.put<ApiResponse<Persona>>(
      `${this.API_URL}/${id}`,
      persona
    );
  }

  delete(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API_URL}/${id}`);
  }
}
