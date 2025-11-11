import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Amenity from '../../../../models/property/complements/Amenity';
import { PropertyService } from '../../../../services/propertyServices/property/property-service';
import { PageResponse } from '../../../../models/pagable/PageResponse';
import Property from '../../../../models/property/Property';

@Component({
  selector: 'app-input-amenities',
  imports: [ReactiveFormsModule],
  templateUrl: './input-amenities.html',
  styleUrl: './input-amenities.css',
})
export class InputAmenities implements OnInit{

  @Input() group!: FormGroup;

  amenitiesArray: Amenity[] = []

  constructor(
    private fb : FormBuilder,
    private service : PropertyService
  ) { }

  ngOnInit(): void {
    this.loadAmenities()
  }

  loadAmenities() {
    this.service.getAvailableAmenities().subscribe({
      next: (data) => {
        this.amenitiesArray = data;

        // It is a control form array, by every amenitie, will create an control in false.
        // The result is an form control with false, once false by amenitie.
        const amenityControls = this.amenitiesArray.map(() => this.fb.control(false));

        // The form array is setting into de form array from form group.
        this.group.setControl('amenities', this.fb.array(amenityControls));
      },
      error: (e) => console.log(e)
    });
  }

  addExistingAmenity(){
    
  }

  addNewAmenity(){
    
  }



  // Nota de compatibilidad:
  // Ya que las funciones 'addExistingAmenity', 'addNewAmenity' y 'removeAmenity' se llaman directamente
  // desde el HTML usando `onclick="..."`, en un entorno modular de TypeScript (como en frameworks),
  // estas funciones tendrían que ser exportadas y posiblemente accesibles desde el ámbito global (window)
  // o el HTML tendría que ser gestionado por un framework (como Angular, React, etc.).
  // Para este ejemplo de vanilla TS que emula el JS original, se asume un script global.

} 
