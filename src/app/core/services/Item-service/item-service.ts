import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ConfigurationType } from '../../models/ConfigurationType';
import { GenericItem } from '../../models/GenericItem';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private apiZone = 'http://localhost:8080/zone'; // Tu URL base
  private apiAmenity = 'http://localhost:8080/amenity'; // Tu URL base //CAMBIAR ESTO

  constructor(private http: HttpClient) { }

  getItems(type: 'Amenity' | 'Zone'): Observable<GenericItem[]> {

    const endpoint = type === 'Amenity' ? this.apiAmenity : this.apiZone;

    // Nota: El get espera 'any[]' porque viene Amenity[] o ZoneDTO[], no GenericItem[]
    return this.http.get<any[]>(`${endpoint}/all`).pipe(
      map(response => {

        return response.map(item => {
          // Lógica de mapeo: detectamos qué campos usar según el tipo
          // Asumo que Amenity tiene 'name' y Zone tiene 'name' o 'zoneName'
          const name = type === 'Amenity' ? item.amenityName : item.zoneName;

          return {
            itemName: name,
            isFeatured: item.isFeatured || false,
            type: type === 'Amenity' ? ConfigurationType.AMENITY : ConfigurationType.ZONE,
            originalData: item // Guardamos el objeto original para usarlo al guardar
          } as GenericItem;
        }
        );
      }
      )
    );
  }

  /**
   * Recibe GenericItems, extrae la data real y la envía al backend
   */
  updateFeatures(items: GenericItem[], type: 'Amenity' | 'Zone'): Observable<any> {
    const endpoint = type === 'Amenity' ? this.apiAmenity : this.apiZone;

    // DES-MAPEO: Convertimos GenericItem de vuelta a Amenity o ZoneDTO
    // Solo enviamos al backend lo que él espera recibir
    const payload = items.map(generic => {
      // Tomamos el objeto original
      const original = { ...generic.originalData };

      // Le actualizamos el flag con el valor que modificó el usuario en la tabla
      // (Usamos 'any' temporalmente para asignar dinámicamente si los campos varían)
      (original as any).isFeatured = generic.isFeatured;

      return original;
    });

    return this.http.put(`${endpoint}/update/features`, payload);
  }

  findByName(name: string, type: ConfigurationType): Observable<GenericItem> {
    const endpoint = type === ConfigurationType.AMENITY ? this.apiAmenity : this.apiZone;

    // Asumo que tu endpoint es algo como /amenity/get/{name} o /amenity/find?name={name}
    // Ajusta la URL según tu backend real.
    return this.http.get<any>(`${endpoint}/get/find-by-name/${name}`).pipe(
      map((item: any) => {

        const name = type === 'Amenity' ? item.amenityName : item.zoneName;
        // Reutilizamos la misma lógica de transformación que en el findAll
        return {
          itemName: name, // O item.zoneName según tu DTO
          isFeatured: item.isFeatured || false,
          type: type,
          originalData: item
        };
      })
    );
  }

  delete(identifier: string | number, type: ConfigurationType): Observable<void> {
    const endpoint = type === ConfigurationType.AMENITY ? this.apiAmenity : this.apiZone;

    return this.http.delete<void>(`${endpoint}/delete/${identifier}`);
  }
}
