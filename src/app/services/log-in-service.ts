import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogInService {

  readonly url: string = "http://localhost:8080/auth/login"

  constructor(
    private http: HttpClient
  ) { }

  
  post(credential: Credential) : Observable<Credential>{
      return this.http.post<Credential>(this.url, credential).pipe(
      catchError(err => {
      console.error('Error en POST', err);
      return throwError(() => new Error('Error al enviar credenciales'));
    })
  );
  }

}
