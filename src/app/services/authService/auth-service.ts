import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import CredentialRegister from '../../models/auth/CredentialRegister';
import CredentialLogIn from '../../models/auth/CredentialLogIn';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import TokenResponseDTO from '../../models/auth/TokenResponseDTO';
import { Token } from '@angular/compiler';
import JwtPayload from '../../models/auth/JwtPayload';

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

  logIn(credential: CredentialLogIn) : Observable<TokenResponseDTO>{
    return this.http.post<TokenResponseDTO>(`${this.url}/login`, credential);
  }

  saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token)
  }

  getToken(): string | null{
    return localStorage.getItem(this.TOKEN_KEY)
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
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

  // 6. Método extra de conveniencia
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Aquí podrías añadir lógica para ver si el token expiró
    return true;
  }
}
