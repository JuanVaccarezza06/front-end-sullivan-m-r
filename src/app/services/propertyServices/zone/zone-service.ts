import { Injectable } from '@angular/core';
import ZoneDTO from '../../../models/property/geography/Zone';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {

  readonly API_URL = "http://localhost:8080/zone"

  constructor(
    private http: HttpClient
  ) { }

  getAll() {
    return this.http.get<ZoneDTO[]>(`${this.API_URL}/all`);
  }

}
