import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Property from '../../models/properties/Property';
import { Observable } from 'rxjs';
import PropertiesFilter from '../../models/PropertiesFilter';
import PropertyPost from '../../models/properties/PropertyPost';
import { HatoasPageResponse } from '../../models/HatoasPageResponse';
import OperationType from '../../models/OperationType';
import PropertyType from '../../models/PropertyType';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  readonly API_URL = `${environment.urlAPI}/property`;

  readonly TOKEN_KEY = 'token';

  readonly not_found = 'public/not-found-image.png';

  readonly size = 8;

  constructor(private http: HttpClient) {}

  // En tu servicio
  getAll(page: number): Observable<HatoasPageResponse<Property>> {
    // La llamada sigue igual, pero el tipo de retorno cambia
    return this.http.get<HatoasPageResponse<Property>>(
      `${this.API_URL}/find-all?page=${page}&size=${this.size}`,
    );
  }

  getById(id: number) {
    return this.http.get<Property>(`${this.API_URL}/find-by-id/${id}`);
  }

  // --- MÉTODO NUEVO: REGISTRAR VISITA ---
  registerView(id: number | string) {
    // POST /api/properties/123/view
    return this.http.post<void>(`${this.API_URL}/${id}/view`, {});
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



  processPropertyImages(properties: Property[]): Property[];
  processPropertyImages(properties: Property): Property;
  processPropertyImages(input: any): any {
    if (!input) return Array.isArray(input) ? [] : input;

    const processSingle = (property: Property): Property => {
      const mainImage = property.imageDTOList?.find((img: any) => img.isPrimary);
      const coverUrl = mainImage
        ? mainImage.url
        : property.imageDTOList?.[0]?.url || this.not_found;

      return {
        ...property,
        mainImageUrl: coverUrl,
      };
    };

    if (Array.isArray(input)) {
      return input.map((prop: Property) => processSingle(prop));
    }

    return processSingle(input);
  }

  applyFilter(filter: PropertiesFilter, page: number): Observable<HatoasPageResponse<Property>> {
    // <--- CAMBIO 1: El tipo de retorno
    return this.http.post<HatoasPageResponse<Property>>( // <--- CAMBIO 2: El tipo del post
      `${this.API_URL}/filter?page=${page}&size=${this.size}`,
      filter,
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
