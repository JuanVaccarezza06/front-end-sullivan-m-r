import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import CredentialRegister from '../../models/auth/CredentialRegister';
import CredentialLogIn from '../../models/auth/CredentialLogIn';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import TokenResponseDTO from '../../models/auth/TokenResponseDTO';
import { Token } from '@angular/compiler';
import JwtPayload from '../../models/auth/JwtPayload';
import User from '../../models/actors/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  readonly url: string = "http://localhost:8080/auth"
  readonly TOKEN_KEY = "token"

  constructor(
    private http: HttpClient
  ) { }


  register(credential: CredentialRegister): Observable<TokenResponseDTO> {
    return this.http.post<TokenResponseDTO>(`${this.url}/register`, credential);
  }

  logIn(credential: CredentialLogIn): Observable<TokenResponseDTO> {
    return this.http.post<TokenResponseDTO>(`${this.url}/login`, credential);
  }

  saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token)
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getUsername(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;

    try {
      // 1. Separar el Payload
      const base64Url = token.split('.')[1];

      // 2. Convertir Base64Url a Base64 estándar
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      // 3. FIX: Agregar Padding (Esto es lo que probablemente fallaba)
      // Base64 debe tener una longitud múltiplo de 4. Si falta, se agregan '='.
      const pad = base64.length % 4;
      if (pad) {
        base64 += '='.repeat(4 - pad);
      }

      // 4. Decodificar Base64 a string binario
      const binaryString = window.atob(base64);

      // 5. Convertir string binario a Uint8Array (bytes reales)
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 6. Decodificar bytes a UTF-8 usando la API moderna del navegador
      // Esto maneja perfecto acentos, emojis y símbolos como #
      const jsonPayload = new TextDecoder().decode(bytes);

      const decoded = JSON.parse(jsonPayload);

      console.log('Token decodificado:', decoded); // <--- Debug: mira si aquí sale el #
      return decoded.sub;

    } catch (error) {
      console.error('Error crítico al decodificar token:', error);
      return null;
    }
  }

  // 5. Método para LEER el token (tu lógica de roles)
  hasRoleAdmin(): boolean {
    const token = this.getToken(); // Usa el método de este servicio
    if (!token) return false;
    try {
      const payload: JwtPayload = jwtDecode(token);
      const roles: string[] = payload.roles || [];
      return roles.includes('ROLE_ADMIN');
    } catch (e) {
      console.error('Error decodificando el token:', e);
      return false;
    }
  }

  // 1. REFACTORIZACIÓN SENIOR
  isLoggedIn(): boolean {
    const token = this.getToken();

    // Si no hay token, fuera.
    if (!token) return false;

    // Si hay token, verificamos que no esté vencido matemáticamente
    const isExpired = this.isTokenExpired(token);

    // Si está vencido, limpiamos la basura y decimos false
    if (isExpired) {
      this.logout();
      return false;
    }

    return true;
  }

  // 2. LÓGICA DE DECODIFICACIÓN (Sin librerías externas)
  private isTokenExpired(token: string): boolean {
    try {
      // El JWT tiene 3 partes separadas por puntos. La segunda es el payload.
      const payloadBase64 = token.split('.')[1];

      // Decodificamos base64 a string y luego a JSON
      const decodedJson = JSON.parse(atob(payloadBase64));

      // El campo 'exp' viene en SEGUNDOS, Date.now() es en MILISEGUNDOS
      const expirationDate = decodedJson.exp * 1000;
      const now = Date.now();

      // Si la fecha de expiración es menor a "ahora", ya venció.
      return expirationDate < now;

    } catch (error) {
      // Si el token tiene formato inválido, asumimos que está vencido/corrupto
      return true;
    }
  }
}
