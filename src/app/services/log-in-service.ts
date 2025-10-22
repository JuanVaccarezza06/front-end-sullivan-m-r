import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import CredentialLogIn from '../models/CredentialLogIn';

@Injectable({
  providedIn: 'root'
})
export class LogInService {

  readonly url: string = "http://localhost:8080/auth/login"

  constructor(
    private http: HttpClient
  ) { }

  
  post(credential: CredentialLogIn) : Observable<CredentialLogIn>{
      return this.http.post<CredentialLogIn>(this.url, credential).pipe(
      catchError(err => {
      console.error('Error en POST', err);
      return throwError(() => new Error('Error al enviar credenciales'));
    })
  );
  }

}
