import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import UserFull from '../../models/actors/UserFull';
import User from '../../models/actors/User';
import { HatoasPageResponse } from '../../models/pagable/HatoasPageResponse';
import Role from '../../models/auth/Role';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly API_URL = 'http://localhost:8080/users';

  readonly TOKEN_KEY = 'token';

  constructor(private http: HttpClient) {}

  getAll(page: number): Observable<HatoasPageResponse<UserFull>> {
    // <--- CAMBIO DE TIPO
    return this.http.get<HatoasPageResponse<UserFull>>(
      `${this.API_URL}/find-all-full-users?page=${page}&size=8`
    );
  }

  update(user: User, email: string): Observable<User> {
    const url = `${this.API_URL}/update/${email}`;
    return this.http.put<User>(url, user);
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
      `${this.API_URL}/find-by-name?name=${name}&page=${page}&size=10`
    );
  }

  getUserByUsername(username: string): Observable<User> {
    // SOLUCIÓN AQUÍ: Envolvemos la variable con encodeURIComponent
    // Sonia123#  --->  Sonia123%23
    const safeUsername = encodeURIComponent(username);
    console.log(safeUsername);
    // 4. Petición GET
    return this.http.get<User>(`${this.API_URL}/find-by-username/${safeUsername}`);
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
