import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Property from '../../../models/property/Property';
import Zone from '../../../models/property/Zone';
import OperationType from '../../../models/property/OperationType';
import PropertyType from '../../../models/property/PropertyType';
import Amenity from '../../../models/property/Amenity';
import PropertiesFilter from '../../../models/property/PropertiesFilter';
import { Observable } from 'rxjs';
import { PageResponse } from '../../../models/pagable/PageResponse';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  readonly API_URL = "http://localhost:8080/property"

  constructor(
    private http: HttpClient
  ) { }

  getAll(page : number) {
    return this.http.get<PageResponse<Property>>(`${this.API_URL}/find-all?page=${page}&size=8`);
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

  getAvailableAmenities() {
    return this.http.get<Amenity[]>(`${this.API_URL}/available-amenities`);
  }

  applyFilter(filter : PropertiesFilter) {
    return this.http.post<Property[]>(`${this.API_URL}/filter`,filter);
  }

  post(property: Property) {
    return this.http.post<Property>(`${this.API_URL}/post`, property);
  }


}
