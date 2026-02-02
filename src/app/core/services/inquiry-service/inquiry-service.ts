import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InquiryModel } from '../../models/InquiryModel';
import { Observable } from 'rxjs';
import { HatoasPageResponse } from '../../models/HatoasPageResponse';

@Injectable({
  providedIn: 'root',
})
export class InquiryService {
  readonly API_URL: string = 'http://localhost:8080/inquiry';
  readonly size: number = 8;

  constructor(private http: HttpClient) {}

  post(inquiry: InquiryModel) {
    return this.http.post(`${this.API_URL}/post`, inquiry);
  }

  getAll(page: number): Observable<HatoasPageResponse<InquiryModel>> {
    // La llamada sigue igual, pero el tipo de retorno cambia
    return this.http.get<HatoasPageResponse<InquiryModel>>(
      `${this.API_URL}/find-all?page=${page}&size=${this.size}`,
    );
  }
}
