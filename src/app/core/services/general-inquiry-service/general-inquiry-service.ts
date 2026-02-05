import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import GeneralInquiry from '../../models/GeneralInquiry';
import { HatoasPageResponse } from '../../models/HatoasPageResponse';

@Injectable({
  providedIn: 'root',
})
export class GeneralInquiryService {
  // Inyección moderna (Angular 16+)
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = `http://localhost:8080/general-inquiry`;

  post(generalInquiry: GeneralInquiry) {
    return this._http.post(`${this._baseUrl}/post`, generalInquiry);
  }

  /**
   * Búsqueda paginada utilizando la interfaz Hatoas con Index Signature.
   */
  search(
    term: string,
    state: string,
    page: number,
    size: number,
  ): Observable<{ content: GeneralInquiry[]; total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('state', state);

    if (term) {
      params = params.set('term', term);
    }

    return this._http
      .get<HatoasPageResponse<GeneralInquiry>>(`${this._baseUrl}/search`, { params })
      .pipe(
        map((response) => {
          // 1. Obtenemos el total de elementos de la metadata
          const total = response.page.totalElements;

          // 2. Extraemos la lista de datos.
          // Como tu interfaz usa [key: string], no sabemos el nombre exacto de la propiedad ('generalInquiryDTOList', etc).
          // Usamos Object.values para obtener los arrays que vengan dentro de _embedded y tomamos el primero.
          if (response._embedded) {
            const dataLists = Object.values(response._embedded);
            const content = dataLists.length > 0 ? dataLists[0] : [];
            return { content, total };
          }

          // Si _embedded no existe (página vacía), devolvemos array vacío
          return { content: [], total };
        }),
      );
  }

  /**
   * Actualiza el estado de la consulta.
   */
  updateState(id: number, newState: string): Observable<GeneralInquiry> {
    return this._http.put<GeneralInquiry>(`${this._baseUrl}/${id}/state`, newState);
  }
}
