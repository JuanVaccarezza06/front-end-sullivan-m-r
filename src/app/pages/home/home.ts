import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import Property from '../../models/property/Property';
import { PropertyService } from '../../services/propertyServices/property/property-service';
import { ImgBbService } from '../../services/propertyServices/imgBB/img-bb-service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Zone from '../../models/property/Zone';
import PropertyType from '../../models/property/PropertyType';
import OperationType from '../../models/property/OperationType';
import { Properties } from '../properties/properties';
import { errorContext } from 'rxjs/internal/util/errorContext';
import PropertiesFilter from '../../models/property/PropertiesFilter';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  mensajeExito: string = '';
  isLogged: boolean = false;
  imageNotFound!: string

  propertiesfeature!: Property[]

  zoneArray!: Zone[]
  propertyTypesArray!: PropertyType[]

  operationTypeArray!: OperationType[]


  form!: FormGroup


  constructor(
    private service: PropertyService,
    private imgService: ImgBbService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {

    const state = this.router.lastSuccessfulNavigation?.extras?.state as { message?: string };
    let message = state?.message || undefined;

    this.formInitializer()

    this.isFromAuthPage(message); // It validate if we have to show the message from any auth page

    this.loadFeaturedProperties();
    this.loadAvailablesZones();
    this.loadAvailablesOperationTypes();
    this.loadAvailablePropertyTypes();

    this.imageNotFound = this.imgService.getNotFound() // Load the not found image

  }

  formInitializer() {
    this.form = this.fb.group({
      operationTypes: ['', [Validators.required]],
      propertyTypes: ['', [Validators.required]],
      zone: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(3)]]
    });
  }

  loadFeaturedProperties() {
    this.service.getFeaturedProperties().subscribe({
      next: (data) => {
        this.propertiesfeature = data
        this.propertiesfeature.forEach((value) => this.choiceMainImage(value))
      },
      error: (e) => console.log(e)
    });
  }

  loadAvailablesOperationTypes() {
    this.service.getAvailablesOperationTypes().subscribe({
      next: (data) => {
        this.operationTypeArray = data;
      },
      error: (e) => console.log(e)
    });
  }

  loadAvailablePropertyTypes() {
    this.service.getAvailablePropertyTypes().subscribe({
      next: (data) => {
        this.propertyTypesArray = data;
      },
      error: (e) => console.log(e)
    });
  }

  loadAvailablesZones() {
    this.service.getAvailableZones().subscribe({
      next: (data) => {
        this.zoneArray = data;
      },
      error: (e) => console.log(e)
    });
  }

  isFromAuthPage(message?: string) {
    if (message) {
      this.isLogged = true;
      this.mensajeExito = message
      setTimeout(() => {
        this.isLogged = false;
      }, 2000);
    }
  }

  choiceMainImage(p: Property) {
    if (!p.imageDTOList || p.imageDTOList.length == 0) p.mainImage = this.imageNotFound; // If the image array is null or empty, we load the not found image in the cards
    else if (!p.imageDTOList.find(img => img.name.includes("Portada"))) p.mainImage = p.imageDTOList[0].url // If the image array don't has any image with 'portada' name, load any image
    else p.mainImage = p.imageDTOList.find(img => img.name.includes("Portada"))?.url // If the image array has the 'portada' image, it returs
  }

  makeFilter() {
    const filterResult = {
      operationTypeDTOList: [
        { "operationName": this.form.get('operationTypes')?.value }
      ],
      propertyTypeDTOList: [
        { "typeName": this.form.get('propertyTypes')?.value }

      ],
      zoneDTOList: [
        { "zoneName": this.form.get('zone')?.value }
      ],
      minPrice: 0,
      maxPrice: 0,
      rooms: 0,
      amenityDTOList: []
    } as PropertiesFilter

    this.service.applyFilter(filterResult).subscribe({
      next: (data) => {
        console.log(data)
        this.router.navigate(['properties'], {
        state: { filterHomeArray: data }
      })
    },
      error: (e) => console.log(e)
    })
  }

  onSumbit() {
  }
}
