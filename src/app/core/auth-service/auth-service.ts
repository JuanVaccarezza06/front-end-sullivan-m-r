import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import CredentialRegister from '../models/auth/CredentialRegister';
import TokenResponseDTO from '../models/auth/TokenResponseDTO';
import CredentialLogIn from '../models/auth/CredentialLogIn';
import JwtPayload from '../models/auth/JwtPayload';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  readonly url: string = 'http://localhost:8080/auth';
  readonly TOKEN_KEY = 'token';

  constructor(private http: HttpClient) {}

  register(credential: CredentialRegister): Observable<TokenResponseDTO> {
    return this.http.post<TokenResponseDTO>(`${this.url}/register`, credential);
  }

  logIn(credential: CredentialLogIn): Observable<TokenResponseDTO> {
    return this.http.post<TokenResponseDTO>(`${this.url}/login`, credential);
  }

  saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // --- NUEVO MÉTODO: Devuelve todo el objeto JSON del token ---
  getTokenPayload(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      if (pad) {
        base64 += '='.repeat(4 - pad);
      }
      const binaryString = window.atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const jsonPayload = new TextDecoder().decode(bytes);
      return JSON.parse(jsonPayload); // Devuelve el objeto completo (sub, roles, iat, exp, etc.)
    } catch (error) {
      console.error('Error decodificando payload:', error);
      return null;
    }
  }

  // Ahora getUsername reutiliza el método anterior para no repetir código
  getUsername(): string | null {
    const payload = this.getTokenPayload();
    return payload ? payload.sub : null;
  }

  hasRoleAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload: JwtPayload = jwtDecode(token);
      const roles: string[] = payload.roles || [];
      return roles.includes('ROLE_ADMIN');
    } catch (e) {
      return false;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const isExpired = this.isTokenExpired(token);
    if (isExpired) {
      this.logout();
      return false;
    }
    return true;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = JSON.parse(atob(payloadBase64));
      const expirationDate = decodedJson.exp * 1000;
      const now = Date.now();
      return expirationDate < now;
    } catch (error) {
      return true;
    }
  }
}
