import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import CredentialRegister from '../models/CredentialRegister';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  readonly url: string = "http://localhost:8080/auth/register"

  constructor(
    private http: HttpClient
  ) { }

  
  post(credential: CredentialRegister){
    return this.http.post(this.url,credential)
  }

}
