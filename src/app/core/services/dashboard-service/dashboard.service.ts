import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DashboardResponse } from '../../models/dashboard.interfaces';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  // Ajusta el puerto si es necesario (8080 es el default de Spring)
  private apiUrl = 'http://localhost:8080/api/dashboard'; 

  getSummary() {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/summary`);
  }
}