import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InquiryModel } from '../../models/InquiryModel';
import { Observable } from 'rxjs';
import { HatoasPageResponse } from '../../models/HatoasPageResponse';
import State from '../../models/State';

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

  search(query: string, state: string, page: number): Observable<HatoasPageResponse<InquiryModel>> {
    // Usamos HttpParams para armar la query string limpia (?query=...&state=...&page=...)
    let params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', '10');

    if (state && state !== 'ALL') {
      params = params.set('state', state);
    }

    return this.http.get<HatoasPageResponse<InquiryModel>>(`${this.API_URL}/search`, { params });
  }

  updateState(id: number, state: State): Observable<InquiryModel> {
    return this.http.put<InquiryModel>(
      `${this.API_URL}/put-state/${id}`,state
    );
  }

}
