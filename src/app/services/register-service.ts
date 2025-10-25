import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import CredentialRegister from '../models/CredentialRegister';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  readonly url: string = "http://localhost:8080/auth/register"

  constructor(
    private http: HttpClient
  ) { }

  
  post(credential: CredentialRegister){
        console.log(credential)
        return this.http.post<CredentialRegister>(this.url, credential).pipe(
        catchError(err => {
        console.error('Error en POST', err);
        return throwError(() => new Error('Error al enviar credenciales'));
      })
    );
    }

}
