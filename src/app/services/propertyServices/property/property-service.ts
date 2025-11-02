import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Property from '../../../models/property/Property';
import Zone from '../../../models/property/Zone';
import OperationType from '../../../models/property/OperationType';
import PropertyType from '../../../models/property/PropertyType';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  readonly API_URL = "http://localhost:8080/property"

  constructor(
    private http: HttpClient
  ) { }

  getAll() {
    return this.http.get<Property[]>(`${this.API_URL}/find-all`);
  }

  getFeaturedProperties() {
    return this.http.get<Property[]>(`${this.API_URL}/featured-properties`);
  }

  getAvailableZones() {
    return this.http.get<Zone[]>(`${this.API_URL}/available-zones`);
  }

  getAvailablesOperationTypes() {
    return this.http.get<OperationType[]>(`${this.API_URL}/available-operation-types`);
  }

  getAvailablePropertyTypes() {
    return this.http.get<PropertyType[]>(`${this.API_URL}/available-property-types`);
  }

  applyFilter(){
    return this.http.get<Property[]>(`${this.API_URL}/filter`,);
  }

  post(property: Property) {
    return this.http.post<Property>(`${this.API_URL}/post`, property);
  }


}
