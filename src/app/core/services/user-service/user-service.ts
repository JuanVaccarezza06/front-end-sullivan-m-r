import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import UserFull from '../../models/actors/UserFull';
import User from '../../models/actors/User';
import { HatoasPageResponse } from '../../models/HatoasPageResponse';
import Role from '../../models/auth/Role';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly API_URL = `${environment.urlAPI}/users`;

  readonly TOKEN_KEY = 'token';

  constructor(private http: HttpClient) {}

  getAll(page: number): Observable<HatoasPageResponse<UserFull>> {
    // <--- CAMBIO DE TIPO
    return this.http.get<HatoasPageResponse<UserFull>>(
      `${this.API_URL}/find-all-full-users?page=${page}&size=8`,
    );
  }

  update(user: UserFull, email: string): Observable<UserFull> {
    // Angular codifica esto AUTOMÁTICAMENTE
    const params = new HttpParams().set('email', email);

    // Fíjate que quitamos el email de la URL principal
    const url = `${this.API_URL}/update`;

    return this.http.put<UserFull>(url, user, { params });
  }

  getByEmail(email: string): Observable<UserFull> {
    const url = `${this.API_URL}/find-by-email?email=${email}`;
    return this.http.get<UserFull>(url);
  }

  getRolesByUsername(username: string): Observable<Role[]> {
    // 2. Usamos HttpParams para que Angular codifique automáticamente
    // El caracter '#' se convertirá en '%23' solo
    const params = new HttpParams().set('username', username);

    // 3. Pasamos { params } como segundo argumento
    // NOTA: Quité el query string manual de la URL, Angular lo agrega
    return this.http.get<Role[]>(`${this.API_URL}/find-roles-by-username`, { params });
  }

  // user-service.ts
  getByPhone(phone: string): Observable<UserFull> {
    // Limpiamos el string para enviar solo números (opcional, depende de tu backend)
    // Si tu backend espera "+54...", no uses el replace. Si espera "54...", úsalo.
    // const cleanPhone = phone.replace(/\D/g, '');
    return this.http.get<UserFull>(`${this.API_URL}/find-by-phone?phone=${phone}`);
  }

  // En user.service.ts
  getByName(name: string, page: number): Observable<HatoasPageResponse<UserFull>> {
    // Ajusta la URL a tu endpoint real
    return this.http.get<HatoasPageResponse<UserFull>>(
      `${this.API_URL}/find-by-name?name=${name}&page=${page}&size=10`,
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    // No enviamos confirmPassword, eso es solo para el front
    return this.http.put(`${this.API_URL}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  getUserByUsername(username: string): Observable<User> {
    // SOLUCIÓN AQUÍ: Envolvemos la variable con encodeURIComponent
    // Sonia123#  --->  Sonia123%23
    const safeUsername = encodeURIComponent(username);
    // 4. Petición GET
    return this.http.get<User>(`${this.API_URL}/find-by-username/${safeUsername}`);
  }

  getUserFullByUsername(username: string): Observable<UserFull> {
    // SOLUCIÓN AQUÍ: Envolvemos la variable con encodeURIComponent
    // Sonia123#  --->  Sonia123%23
    const safeUsername = encodeURIComponent(username);
    console.log("Username codificado para la URL:", safeUsername);
    // 4. Petición GET
    return this.http.get<UserFull>(`${this.API_URL}/find-full-by-username/${safeUsername}`);
  }

  delete(user: UserFull) {
    if (user) {
      return this.http.delete(`${this.API_URL}/deleteByEmail/${user.email}`);
    } else {
      alert('User nula. Delete fallido.');
      throw new Error('User NULL');
    }
  }
}
