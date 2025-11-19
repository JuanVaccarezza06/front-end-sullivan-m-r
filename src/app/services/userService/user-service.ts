import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse } from '../../models/pagable/PageResponse';
import UserFull from '../../models/actors/UserFull';
import User from '../../models/actors/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  readonly API_URL = "http://localhost:8080/users"

  readonly TOKEN_KEY = "token"

  constructor(
    private http: HttpClient
  ) { }

  getAll(page: number): Observable<PageResponse<UserFull>> {

    const token = localStorage.getItem(this.TOKEN_KEY)
    if (!token) {
      console.error("Token no existente")
      throw new Error("There is no token in local storage")
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<PageResponse<UserFull>>(`${this.API_URL}/find-all-full-users?page=${page}&size=5`, { headers: headers });
  }

  update(user: User,email : string): Observable<User> {

    const token = localStorage.getItem(this.TOKEN_KEY)
    if (!token) throw new Error("Token no existente")


    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const url = `${this.API_URL}/update/${email}`;

    return this.http.put<User>(url, user, { headers: headers });
  }

  getByEmail(email: string): Observable<UserFull> {

    const token = localStorage.getItem(this.TOKEN_KEY)
    if (!token) throw new Error("Token no existente")


    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const url = `${this.API_URL}/find-by-email?email=${email}`;

    return this.http.get<UserFull>(url, { headers: headers });
  }

  delete(user: UserFull) {

    const token = localStorage.getItem(this.TOKEN_KEY)
    if (!token) throw new Error("No existe un token")

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    })  

    if (user) {
      return this.http.delete(`${this.API_URL}/deleteByEmail/${user.email}`, { headers: headers });
    } else {
      alert("User nula. Delete fallido.")
      throw new Error("User NULL")
    }


  }

}
