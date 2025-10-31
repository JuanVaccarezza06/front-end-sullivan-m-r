import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Property from '../../../models/property/Property';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  readonly API_URL = "http://localhost:8080/property"

  constructor(
    private http : HttpClient
  ){}

  getAll(){
    return this.http.get<Property[]>(`${this.API_URL}/find-all`);
  }

  post(property : Property){
    return this.http.post<Property>(`${this.API_URL}/post`,property);
  }

  
}
