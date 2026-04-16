import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Property from '../../../core/models/properties/Property';
import PropertyType from '../../../core/models/PropertyType';
import OperationType from '../../../core/models/OperationType';
import ZoneDTO from '../../../core/models/Zone';
import { PropertyService } from '../../../core/services/property-service/property-service';
import { ZoneService } from '../../../core/services/zone-service/zone-service';
import PropertiesFilter from '../../../core/models/PropertiesFilter';
import { DecimalPipe } from '@angular/common';
import { StatusCard } from '../../../shared/components/ui/status-card/status-card';

// 1. Definimos el validador (fuera de la clase del componente)
export function atLeastOneFilterValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // control.get() busca los valores actuales en el FormGroup
    const operation = control.get('operationTypes')?.value;
    const property = control.get('propertyTypes')?.value;
    const zone = control.get('zone')?.value;

    // Si los tres están vacíos (falsy), devolvemos el error
    if (!operation && !property && !zone) {
      return { atLeastOneRequired: true };
    }

    // Si al menos uno tiene algo, el formulario es válido
    return null;
  };
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, ReactiveFormsModule, DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  form!: FormGroup;

  // With this variables I can control the messages from login page
  sucessMessage: string = '';
  isFromLogin: boolean = false;

  // Image not found for the properties main images not found
  imageNotFound!: string;

  // Objects that I need to show
  propertiesfeature!: Property[];
  zoneArray!: ZoneDTO[];
  zoneArrayFeatured!: ZoneDTO[];
  propertyTypesArray!: PropertyType[];
  operationTypeArray!: OperationType[];

  constructor(
    private service: PropertyService,
    private zoneService: ZoneService,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    const state = this.router.lastSuccessfulNavigation?.extras?.state as { message?: string };
    let message = state?.message || undefined;

    this.isFromAuthPage(message); // It validate if we have to show the message from any auth page

    this.formInitializer();

    this.loadAvailablesZones();
    this.loadAvailablesOperationTypes();
    this.loadAvailablePropertyTypes();
    this.loadFeaturedProperties();
  }

  isFromAuthPage(message?: string) {
    if (message) {
      this.isFromLogin = true;
      this.sucessMessage = message;
      setTimeout(() => {
        this.isFromLogin = false;
      }, 3000);
    }
  }

  loadFeaturedProperties() {
    this.service.getFeaturedProperties().subscribe({
      next: (data) => {
        this.propertiesfeature = data;
        this.propertiesfeature = this.service.processPropertyImages(data);
      },
      error: (e) => console.log(e),
    });
  }

  viewDetail(propertyToSee: Property) {
    return this.router.navigate(['properties', propertyToSee.id], {
      state: { propertyData: propertyToSee },
    });
  }

  formInitializer() {
    this.form = this.fb.group(
      {
        operationTypes: [''],
        propertyTypes: [''],
        zone: [''],
      },
      { validators: atLeastOneFilterValidator() },
    ); // <-- Aquí aplicamos el validador global
  }

  loadAvailablesOperationTypes() {
    this.service.getAvailablesOperationTypes().subscribe({
      next: (data) => {
        this.operationTypeArray = data;
      },
      error: (e) => console.log(e),
    });
  }

  loadAvailablePropertyTypes() {
    this.service.getAvailablePropertyTypes().subscribe({
      next: (data) => {
        this.propertyTypesArray = data;
      },
      error: (e) => console.log(e),
    });
  }

  loadAvailablesZones() {
    this.zoneService.getAll().subscribe({
      next: (data) => {
        this.zoneArray = data;
        this.zoneArrayFeatured = data.filter((value) => value.isFeatured);
      },
      error: (e) => console.log(e),
    });
  }

  makeFilter() {
    // Obtenemos los valores actuales del formulario
    const opType = this.form.get('operationTypes')?.value;
    const propType = this.form.get('propertyTypes')?.value;
    const selectedZone = this.form.get('zone')?.value;

    const filterResult = {
      operationTypeDTO: opType ? { operationName: opType } : null,
      propertyTypeDTO: propType ? { typeName: propType } : null,
      
      // Dado que selectedZone ya es un objeto ZoneDTO completo, lo pasamos directo.
      // Si necesitas forzar isFeatured en false, puedes usar el spread operator (...):
      zoneDTO: selectedZone ? { ...selectedZone, isFeatured: false } : null,

      minPrice: 0,
      maxPrice: 0,
      rooms: 0,
      amenityDTOList: [],
    } as PropertiesFilter;

    this.service.applyFilter(filterResult, 0).subscribe({
      next: (data) => {
        const content = data._embedded ? data._embedded['propertyDTOList'] : [];

        if (content.length > 0) {
          console.log('Resultados encontrados:', data);
          this.router.navigate(['properties'], {
            state: { homeResponse: data },
          });
        } else {
          this.router.navigate(['properties'], {
            state: { homeResponse: false },
          });
        }
      },
      error: (e) => console.log(e),
    });
  }

  findMainImageFromFeaturedProperty() {
    if (!this.propertiesfeature) return;

    this.propertiesfeature.forEach((property) => {
      // 1. Buscamos la imagen que tenga isPrimary en true
      const mainImage = property.imageDTOList.find((img) => img.isPrimary);

      // 2. Asignamos la URL encontrada al nuevo atributo.
      // Si no encuentra una primary, usa la primera de la lista [0] como respaldo.
      if (mainImage) {
        property['mainImageUrl'] = mainImage.url; // Ojo: cambia '.url' por como se llame tu propiedad de imagen en el DTO
      } else if (property.imageDTOList.length > 0) {
        property['mainImageUrl'] = property.imageDTOList[0].url;
      } else {
        // 3. (Opcional) Una imagen por defecto si no viene ninguna foto
        property['mainImageUrl'] = this.imageNotFound;
      }
    });
  }
}
