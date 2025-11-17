import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Property from '../../../models/property/Property';
import ZoneDTO from '../../../models/property/geography/Zone';
import OperationType from '../../../models/property/types/OperationType';
import PropertyType from '../../../models/property/types/PropertyType';
import Amenity from '../../../models/property/complements/Amenity';
import { Observable } from 'rxjs';
import { PageResponse } from '../../../models/pagable/PageResponse';
import PropertiesFilter from '../../../models/property/request-response/PropertiesFilter';
import { AuthService } from '../../authService/auth-service';
import PropertyPost from '../../../models/property/PropertyPost';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  readonly API_URL = "http://localhost:8080/property"

  readonly TOKEN_KEY = "token"

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAll(page: number): Observable<PageResponse<Property>> {
    return this.http.get<PageResponse<Property>>(`${this.API_URL}/find-all?page=${page}&size=8`);
  }

  getFeaturedProperties() {
    return this.http.get<Property[]>(`${this.API_URL}/featured-properties`);
  }

  getAvailableZones() {
    return this.http.get<ZoneDTO[]>(`${this.API_URL}/available-zones`);
  }

  getAvailablesOperationTypes() {
    return this.http.get<OperationType[]>(`${this.API_URL}/available-operation-types`);
  }

  getAvailablePropertyTypes() {
    return this.http.get<PropertyType[]>(`${this.API_URL}/available-property-types`);
  }

  getAvailableAmenities() {
    return this.http.get<Amenity[]>(`${this.API_URL}/available-amenities`);
  }

  applyFilter(filter: PropertiesFilter) {
    console.log("DEBAJO ESTA EL JSON QUE SE ENVIA")
    console.log(filter)
    return this.http.post<Property[]>(`${this.API_URL}/filter`, filter);
  }

  post(property: PropertyPost) {

    const token = localStorage.getItem(this.TOKEN_KEY)
    if (!token) return

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const url = `${this.API_URL}/post`;

    return this.http.post(url, property, { headers: headers });

  }

    put(property: PropertyPost) {

    const token = localStorage.getItem(this.TOKEN_KEY)
    if (!token) return

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const url = `${this.API_URL}/update`;

    return this.http.put(url, property, { headers: headers });
 
  }

}
