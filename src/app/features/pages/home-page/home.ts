import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Property from '../../../core/models/properties/Property';
import PropertyType from '../../../core/models/PropertyType';
import OperationType from '../../../core/models/OperationType';
import ZoneDTO from '../../../core/models/Zone';
import { PropertyService } from '../../../core/services/property-service/property-service';
import { ZoneService } from '../../../core/services/zone-service/zone-service';
import { ImgBbService } from '../../../core/services/imgbb-service/img-bb-service';
import PropertiesFilter from '../../../core/models/PropertiesFilter';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ReactiveFormsModule],
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
      }, 2000);
    }
  }

  loadFeaturedProperties() {
    this.service.getFeaturedProperties().subscribe({
      next: (data) => {
        this.propertiesfeature = data;
        this.propertiesfeature.forEach((value) => this.choiceMainImage(value));
      },
      error: (e) => console.log(e),
    });
  }

  choiceMainImage(p: Property): string {
    const images = p.imageDTOList;

    // 1. Caso: No hay imágenes
    if (!images || images.length === 0) {
      return this.imageNotFound;
    }

    // 2. Caso: Buscar la imagen marcada como primaria (isPrimary: true)
    const primaryImg = images.find((img) => img.isPrimary);
    if (primaryImg) {
      return primaryImg.url;
    }

    // 3. Caso: No hay ninguna marcada como primaria, usamos la primera (fallback)
    return images[0].url;
  }

  viewDetail(propertyToSee: Property) {
    return this.router.navigate(['properties', propertyToSee.id], {
      state: { propertyData: propertyToSee },
    });
  }

  formInitializer() {
    this.form = this.fb.group({
      operationTypes: ['', [Validators.required]],
      propertyTypes: ['', [Validators.required]],
      zone: ['', Validators.required],
    });
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
    const filterResult = {
      operationTypeDTO: { operationName: this.form.get('operationTypes')?.value },
      propertyTypeDTO: { typeName: this.form.get('propertyTypes')?.value },
      zoneDTO: {
        zoneName: this.form.get('zone')?.value.zoneName,
        cityDTO: {
          cityName: this.form.get('zone')?.value.cityDTO.cityName,
          provinceDTO: {
            provinceName: this.form.get('zone')?.value.cityDTO.provinceDTO.provinceName,
            countryDTO: {
              countryName: this.form.get('zone')?.value.cityDTO.provinceDTO.countryDTO.countryName,
            },
          },
        },
        isFeatured: false,
      },
      minPrice: 0,
      maxPrice: 0,
      rooms: 0,
      amenityDTOList: [],
    } as PropertiesFilter;

    this.service.applyFilter(filterResult, 0).subscribe({
      next: (data) => {
        // 1. Extraemos el contenido de forma segura
        const content = data._embedded ? data._embedded['propertyDTOList'] : [];

        if (content.length > 0) {
          console.log('Resultados encontrados:', data);

          this.router.navigate(['properties'], {
            // Enviamos el objeto 'data' COMPLETO (que tiene _embedded y page)
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
