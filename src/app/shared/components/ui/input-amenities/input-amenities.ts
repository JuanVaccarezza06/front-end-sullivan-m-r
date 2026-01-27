import { AmenityService } from '../../../../core/services/amenity-service/amenity-service';
import Amenity from '../../../../core/models/Amenity';
import { Component, forwardRef, OnInit, OnDestroy } from '@angular/core';
import {
  ReactiveFormsModule,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormControl,
} from '@angular/forms';

@Component({
  selector: 'app-input-amenities',
  imports: [ReactiveFormsModule],
  templateUrl: './input-amenities.html',
  styleUrl: './input-amenities.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputAmenities),
      multi: true,
    },
  ],
})
export class InputAmenities implements OnInit, OnDestroy, ControlValueAccessor {
  // Listas
  amenitiesArray: Amenity[] = []; // Disponibles desde backend
  amenitiesLoad: Amenity[] = []; // Seleccionadas por el usuario

  // Inputs internos
  amenityControlNew = new FormControl('');
  amenityControlExisting = new FormControl('');

  // Callbacks de CVA
  onChange: any = () => {};
  onTouch: any = () => {};

  constructor(private amenityService: AmenityService) {}

  ngOnInit(): void {
    this.loadAvailableAmenities();
  }

  ngOnDestroy(): void {}

  loadAvailableAmenities() {
    this.amenityService.getAll().subscribe({
      next: (data) => (this.amenitiesArray = data),
      error: (e) => console.error(e),
    });
  }

  // --- LÓGICA DE AGREGAR ---

  addExistingAmenity() {
    const name = this.amenityControlExisting.value;
    // Buscamos el objeto completo que ya tiene su isFeatured correcto
    const originalAmenity = this.amenitiesArray.find((a) => a.amenityName === name);

    if (originalAmenity && !this.amenitiesLoad.find((a) => a.amenityName === name)) {
      this.amenitiesLoad.push({ ...originalAmenity }); // Clonamos para evitar mutaciones
      this.updateModel();
    }
    this.amenityControlExisting.setValue('');
  }

  addNewAmenity() {
    const name = this.amenityControlNew.value;
    if (!name || name.trim().length < 2) return;

    // Verificar si ya existe en la lista cargada
    if (this.amenitiesLoad.find((a) => a.amenityName.toLowerCase() === name.toLowerCase())) return;

    // Crear objeto Amenity
    const newAmenity: Amenity = {
      amenityName: name,
      isFeatured: false,
    };

    // Opción A: Guardarlo en Backend YA (como tenías antes)
    this.amenityService.post(newAmenity).subscribe({
      next: (savedAmenity) => {
        this.amenitiesLoad.push(savedAmenity);
        this.updateModel();
        // Recargar la lista de disponibles por si queremos agregarla de nuevo
        this.loadAvailableAmenities();
      },
      error: (e) => console.error('Error creando amenity', e),
    });

    this.amenityControlNew.setValue('');
  }

  deleteAmenityFromArray(name: string) {
    this.amenitiesLoad = this.amenitiesLoad.filter((a) => a.amenityName !== name);
    this.updateModel();
  }

  // Notificar al padre
  private updateModel() {
    this.onChange(this.amenitiesLoad);
    this.onTouch();
  }

  // --- IMPLEMENTACIÓN CVA ---

  writeValue(value: Amenity[]): void {
    if (value && Array.isArray(value)) {
      this.amenitiesLoad = [...value]; // Copia para evitar mutaciones externas
    } else {
      this.amenitiesLoad = [];
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.amenityControlNew.disable() : this.amenityControlNew.enable();
  }
}
