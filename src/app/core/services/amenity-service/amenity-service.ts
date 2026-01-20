import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Amenity from '../../models/Amenity';

@Injectable({
  providedIn: 'root'
})
export class AmenityService {

  readonly API_URL = "http://localhost:8080/amenity"

  constructor(
    private http: HttpClient
  ) { }

  post(amenity: Amenity) {
    return this.http.post<Amenity>(`${this.API_URL}/post`, amenity);
  }

  getAll() {
    return this.http.get<Amenity[]>(`${this.API_URL}/all`);
  }

  getAmenityByName(name: string) {
    return this.http.get<Amenity>(`${this.API_URL}/get/find-by-name/${name}`);
  }

  delete(amenityName: string) {
    return this.http.delete<void>(`${this.API_URL}/delete/${amenityName}`);
  }

  updateFeatures(amenities: Amenity[]) {
    return this.http.put<Amenity[]>(`${this.API_URL}/update/features`, amenities);
  }

}
