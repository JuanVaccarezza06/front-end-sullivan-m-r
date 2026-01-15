import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Role from '../../../models/auth/Role';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  readonly API_URL: string = 'http://localhost:8080/roles';
  readonly TOKEN_KEY = 'token';

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.API_URL}/find-all`);
  }

  assignRolesToUser(payload: any): Observable<void> {
    // Ya no pasamos (username, roles), pasamos el objeto completo 'payload'
    // Asegúrate de que la URL sea la correcta de tu endpoint
    return this.http.put<void>(`${this.API_URL}/assign-role`, payload);
  }

  deleteRoleFromUser(){
    console.log("Role eliminado correctamente.")
  }
}
