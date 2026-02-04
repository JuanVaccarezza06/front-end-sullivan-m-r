import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import State from '../../models/State';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  readonly API_URL: string = 'http://localhost:8080/state';

  constructor(private http: HttpClient) {}

  getStates(): Observable<State[]> {
    // OJO: La base URL suele ser '.../inquiry', aquí debes cambiar a '.../state'
    // Si tu API_URL es 'http://localhost:8080/inquiry', no lo uses aquí.

    return this.http.get<State[]>(`${this.API_URL}/find-all`);
  }
}
