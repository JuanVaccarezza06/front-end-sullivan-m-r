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
    private service: PropertyService  ,
    private zoneService: ZoneService,
    private imgService: ImgBbService,
    private router: Router,
    private fb: FormBuilder
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

    this.imageNotFound = this.imgService.getNotFound(); // Load the not found image
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

  choiceMainImage(p: Property) {
    if (!p.imageDTOList || p.imageDTOList.length == 0)
      p.mainImage =
        this.imageNotFound; // If the image array is null or empty, we load the not found image in the cards
    else if (!p.imageDTOList.find((img) => img.name.includes('Portada')))
      p.mainImage =
        p.imageDTOList[0].url; // If the image array don't has any image with 'portada' name, load any image
    else p.mainImage = p.imageDTOList.find((img) => img.name.includes('Portada'))?.url; // If the image array has the 'portada' image, it returs
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
}
