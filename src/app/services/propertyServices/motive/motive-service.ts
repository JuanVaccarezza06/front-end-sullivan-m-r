import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import MotiveDTO from '../../../models/contact/MotiveDTO';

@Injectable({
  providedIn: 'root'
})
export class MotiveService {

  // Forma moderna de inyectar dependencias (Angular 16+)
  private http = inject(HttpClient);

  // Ajusta esta URL a tu endpoint real de Spring Boot
  private readonly API_URL = 'http://localhost:8080/motive';

  constructor() { }

  getAllMotives(): Observable<MotiveDTO[]> {
    return this.http.get<MotiveDTO[]>(`${this.API_URL}/all`);
  }

}
