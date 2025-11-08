import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import Amenity from '../../models/property/Amenity';

@Component({
  selector: 'app-input-amenities',
  imports: [ReactiveFormsModule],
  templateUrl: './input-amenities.html',
  styleUrl: './input-amenities.css',
})
export class InputAmenities {

  amenitiesArray: Amenity[] = []


// Nota de compatibilidad:
// Ya que las funciones 'addExistingAmenity', 'addNewAmenity' y 'removeAmenity' se llaman directamente
// desde el HTML usando `onclick="..."`, en un entorno modular de TypeScript (como en frameworks),
// estas funciones tendrían que ser exportadas y posiblemente accesibles desde el ámbito global (window)
// o el HTML tendría que ser gestionado por un framework (como Angular, React, etc.).
// Para este ejemplo de vanilla TS que emula el JS original, se asume un script global.

} 
