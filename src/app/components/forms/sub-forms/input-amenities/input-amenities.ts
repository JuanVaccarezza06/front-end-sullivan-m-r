import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertyService } from '../../../../services/propertyServices/property/property-service';
import { AmenityService } from '../../../../services/propertyServices/amenity/amenity-service';
import Amenity from '../../../../models/property/complements/Amenity';
import { animationFrameProvider } from 'rxjs/internal/scheduler/animationFrameProvider';

@Component({
  selector: 'app-input-amenities',
  imports: [ReactiveFormsModule],
  templateUrl: './input-amenities.html',
  styleUrl: './input-amenities.css',
})
export class InputAmenities implements OnInit, OnChanges {

  @Input() group!: FormGroup;

  @Input() startSignal!: number;

  @Input() isUpdate!: boolean;

  @Output() finishEvent = new EventEmitter<boolean>();

  amenitiesArray: Amenity[] = []

  amenitiesLoad: Amenity[] = []

  amenityControlNew = new FormControl('', [Validators.required]);
  amenityControlExisting = new FormControl('', [Validators.required]);

  constructor(
    private fb: FormBuilder,
    private service: PropertyService,
    private amenityService: AmenityService
  ) { }

  ngOnInit(): void {
    this.loadAmenities()
    if (this.isUpdate) this.patchValues()
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 1. Verifica si el Input cambió
    if (changes['startSignal']) {

      // 2. Opcional: Solo ejecutamos si el valor es mayor a 0 (es decir, ya se hizo un submit)
      // O solo ejecutamos si NO es la primera vez que se inicializa.
      if (!changes['startSignal'].firstChange) {
        this.setAmenitiesWithFrom();
      }
    }
  }

  loadAmenities() {
    this.service.getAvailableAmenities().subscribe({
      next: (data) => {
        this.amenitiesArray = data;
      },
      error: (e) => console.log(e)
    });
  }

  addExistingAmenity() {
    let amenity = {
      amenityName: this.amenityControlExisting.value
    } as Amenity

    if (amenity.amenityName == undefined || amenity.amenityName == "") return

    if (!this.amenitiesLoad.find((value) => value.amenityName == amenity.amenityName)) this.amenitiesLoad.push(amenity)

  }

  deleteAmenityFromArray(name: string) {

    let newAmenities = this.amenitiesLoad.filter((value) => value.amenityName != name)

    if (newAmenities) this.amenitiesLoad = newAmenities
    else console.log("No hay valor en el name llegado por parametro")

  }


  addNewAmenity() {
    let amenity = {
      amenityName: this.amenityControlNew.value
    } as Amenity

    if (amenity.amenityName == undefined || amenity.amenityName == "") return

    if (!this.amenitiesLoad.find(
      (value) => value.amenityName == amenity.amenityName
    )) {
      this.amenityService
        .post(amenity)
        .subscribe({
          next: (data) => this.amenitiesLoad.push(data),
          error: (e) => console.log(e)
        })
    } else return
  }

  setAmenitiesWithFrom() {
    this.group.get('amenities')?.setValue(this.amenitiesLoad)
    console.log("Amenity input. Ya termine de setear los group.")
    this.finishEvent.emit()
  }

  patchValues() {
    if (this.isUpdate) {
      // Tengo solo las imagenes en formato image, que es una url (la de imgbb) y un nombre, NO tengo la url de preview!!!!!
      const amenities = this.group.get('amenities')?.value as Amenity[]
      amenities.forEach(value => {
        this.amenitiesLoad.push({
          amenityName: value.amenityName,
          isFeatured: value.isFeatured
        })
      })

    }
  }



  // Nota de compatibilidad:
  // Ya que las funciones 'addExistingAmenity', 'addNewAmenity' y 'removeAmenity' se llaman directamente
  // desde el HTML usando `onclick="..."`, en un entorno modular de TypeScript (como en frameworks),
  // estas funciones tendrían que ser exportadas y posiblemente accesibles desde el ámbito global (window)
  // o el HTML tendría que ser gestionado por un framework (como Angular, React, etc.).
  // Para este ejemplo de vanilla TS que emula el JS original, se asume un script global.

} 
