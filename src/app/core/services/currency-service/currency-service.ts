import { Injectable } from '@angular/core';
import Currency from '../../models/Currency';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  readonly API_URL = 'http://localhost:8080/currency';

  readonly TOKEN_KEY = 'token';

  readonly not_found = 'public/not-found-image.png';

  readonly size = 8;

  constructor(private http: HttpClient) {}

  getCurrencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>(`${this.API_URL}/get/all-currencies`);
  }
}
