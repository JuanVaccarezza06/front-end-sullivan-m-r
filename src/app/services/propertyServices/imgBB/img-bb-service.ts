import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import ResponseImgBb from '../../../models/property/ResponseImgBb';

@Injectable({
  providedIn: 'root'
})
export class ImgBbService {

    // 2. La API key vive en el servicio, no en el componente
  // ¡RECUERDA! Mueve esto a tus archivos 'environments' por seguridad
  private readonly API_KEY = '70e1b06eb4b0e0358c843bb2b0376d5a';

  // 1. Inyectamos HttpClient aquí
  constructor(
    private http : HttpClient
  ){}


  uploadImage(file: File) {

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
    return this.http.post(apiUrl, formData);
  }

  getNotFound(){
    return "https://i.ibb.co/cK0kNgRj/NOT-FOUND-INDIO.png"
  }
}
