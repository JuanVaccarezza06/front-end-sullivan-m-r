import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import ResponseImgBb from '../../../models/property/request-response/ResponseImgBb';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ImgBbService {

  private readonly API_KEY = environment.imgBbKey;

  // 1. Inyectamos HttpClient aquí
  constructor(
    private http : HttpClient
  ){}


  uploadImage(file: File) : Observable<ResponseImgBb>{

    // FormData is a class from the navegator 
    // It represents a set of key/value pairs, where the values ​​can be strings or files.
    // It is like the box where we send a file data (img, video)
    const formData = new FormData();
    // We add the camps: 'name', 'value', 'filename'
    formData.append('image', file, file.name);


    // 4. La URL de la API se construye aquí
    const apiUrl = `https://api.imgbb.com/1/upload?key=${this.API_KEY}`;

    // 5. El servicio crea y RETORNA la petición POST.
    // OJO: NO nos suscribimos (subscribe) aquí. El componente lo hará.
    return this.http.post<ResponseImgBb>(apiUrl, formData);
  }

  getNotFound(){
    return "https://i.ibb.co/cK0kNgRj/NOT-FOUND-INDIO.png"
  }
}
