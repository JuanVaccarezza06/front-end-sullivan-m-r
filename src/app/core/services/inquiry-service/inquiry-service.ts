import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InquiryModel } from '../../models/InquiryModel';

@Injectable({
  providedIn: 'root'
})
export class InquiryService {

  readonly url: string = "http://localhost:8080/inquiry"

  constructor(
    private http: HttpClient
  ) { }

  post(inquiry: InquiryModel) {
    return this.http.post(`${this.url}/post`, inquiry);
  }

}
