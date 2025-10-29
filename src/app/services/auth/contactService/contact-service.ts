import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import GeneralInquiry from '../../../models/GeneralInquiry';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  readonly url: string = "http://localhost:8080/general-inquiry/post"

  constructor(
    private http: HttpClient
  ) { }

  post(generalInquiry: GeneralInquiry) {
      return this.http.post(this.url,generalInquiry);
  }

  getMotives() {

  }

}



