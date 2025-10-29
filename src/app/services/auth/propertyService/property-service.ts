import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  readonly API_URL = ""

  constructor(
    private http : HttpClient
  ){}

  getAll(){
    return this.http.get(this.API_URL);
  }

  
}
