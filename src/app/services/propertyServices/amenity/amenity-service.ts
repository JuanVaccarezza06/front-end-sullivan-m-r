import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Amenity from '../../../models/property/complements/Amenity';

@Injectable({
  providedIn: 'root'
})
export class AmenityService {

  readonly API_URL = "http://localhost:8080/amenity"

  constructor(
    private http: HttpClient
  ) { }

  post(amenity: Amenity){
    console.log(amenity)
    return this.http.post<Amenity>(`${this.API_URL}/post`,amenity);
  }

}
