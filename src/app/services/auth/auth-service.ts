import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import CredentialRegister from '../../models/CredentialRegister';
import CredentialLogIn from '../../models/CredentialLogIn';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  readonly url: string = "http://localhost:8080/auth"
  readonly TOKEN_KEY = "token"

  constructor(
    private http: HttpClient
  ) { }


  register(credential: CredentialRegister) {
    return this.http.post<CredentialRegister>(`${this.url}/register`, credential);
  }

  logIn(credential: CredentialLogIn) {
    return this.http.post<CredentialLogIn>(`${this.url}/login`, credential);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  

  hasRoleAdmin(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY)
    if (!token) return false;

    let jwt = ''

    // Si el token fue guardado como base64 JSON, lo desempaquetamos
    try {
      const decoded = atob(token);
      const jwt = JSON.parse(decoded);
    } catch {
      // no pasa nada, ya era JWT puro
    }

    try {
      const payload: any = jwtDecode(jwt);
      const roles: string[] = payload.roles || payload.authorities || [];
      return roles.includes('ADMIN');
    } catch (e) {
      console.error('Error verificando rol ADMIN:', e);
      return false;
    }
  }
}
