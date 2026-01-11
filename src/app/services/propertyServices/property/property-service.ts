import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Property from '../../../models/property/Property';
import ZoneDTO from '../../../models/property/geography/Zone';
import OperationType from '../../../models/property/types/OperationType';
import PropertyType from '../../../models/property/types/PropertyType';
import Amenity from '../../../models/property/complements/Amenity';
import { Observable } from 'rxjs';
import PropertiesFilter from '../../../models/property/request-response/PropertiesFilter';
import { AuthService } from '../../authService/auth-service';
import PropertyPost from '../../../models/property/PropertyPost';
import { HatoasPageResponse } from '../../../models/pagable/HatoasPageResponse';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  readonly API_URL = 'http://localhost:8080/property';

  readonly TOKEN_KEY = 'token';

  readonly size = 8;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // En tu servicio
  getAll(page: number): Observable<HatoasPageResponse<Property>> {
    // La llamada sigue igual, pero el tipo de retorno cambia
    return this.http.get<HatoasPageResponse<Property>>(
      `${this.API_URL}/find-all?page=${page}&size=${this.size}`
    );
  }

  getById(id: number) {
    return this.http.get<Property>(`${this.API_URL}/find-by-id/${id}`);
  }

  getFeaturedProperties() {
    return this.http.get<Property[]>(`${this.API_URL}/featured-properties`);
  }

  getAvailablesOperationTypes() {
    return this.http.get<OperationType[]>(`${this.API_URL}/available-operation-types`);
  }

  getAvailablePropertyTypes() {
    return this.http.get<PropertyType[]>(`${this.API_URL}/available-property-types`);
  }

  getAround(number: number) {
    return this.http.get<Property[]>(`${this.API_URL}/${number}/nearby?km=30`);
  }

  // applyFilter(filter: PropertiesFilter, page: number) {
  //   return this.http.post<HatoasPageResponse<Property>>(
  //     `${this.API_URL}/filter?page=${page}&size=${this.size}`,
  //     filter
  //   );
  // }

  applyFilter(filter: PropertiesFilter, page: number): Observable<HatoasPageResponse<Property>> {
    // <--- CAMBIO 1: El tipo de retorno
    return this.http.post<HatoasPageResponse<Property>>( // <--- CAMBIO 2: El tipo del post
      `${this.API_URL}/filter?page=${page}&size=${this.size}`,
      filter
    );
  }

  post(property: PropertyPost) {
    const url = `${this.API_URL}/post`;
    return this.http.post(url, property);
  }

  put(property: PropertyPost): Observable<PropertyPost> {
    const url = `${this.API_URL}/update?id=`;

    return this.http.put<PropertyPost>(`${url}${property.id}`, property);
  }

  delete(property: Property) {
    if (property) {
      return this.http.delete(`${this.API_URL}/delete/${property.id}`);
    } else {
      alert('Property nula. Delete fallido.');
      throw new Error('Property NULL');
    }
  }
}
