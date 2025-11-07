import { Component, ElementRef, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import OperationType from '../../models/property/OperationType';
import Property from '../../models/property/Property';
import { PropertyService } from '../../services/propertyServices/property/property-service';
import { ImgBbService } from '../../services/propertyServices/imgBB/img-bb-service';
import Amenity from '../../models/property/Amenity';
import { Router, RouterLink } from '@angular/router';
import PropertiesFilter from '../../models/property/PropertiesFilter';
import PropertyType from '../../models/property/PropertyType';
import Zone from '../../models/property/Zone';
import { AboutUs } from "../about-us/about-us";

@Component({
  selector: 'app-properties',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './properties.html',
  styleUrl: './properties.css'
})
export class Properties implements OnInit {

  form: FormGroup

  properties!: Property[]

  operationTypes!: OperationType[]

  propertyTypes: PropertyType[] = []

  zones: Zone[] = []

  amenities: Amenity[] = []
  finalamenities: Amenity[] = []

  numberRooms: number[] = [1, 2, 3, 4]
  numberRoomsSelect!: number

  isFilter: boolean = false




  imageNotFound!: string

  constructor(
    private propertyService: PropertyService,
    private imgService: ImgBbService,
    private fb: FormBuilder,
    private router: Router

  ) {

    this.form = this.fb.group({
      operationTypes: ['', [Validators.required]],
      propertyTypes: ['', [Validators.required]],
      minPrice: [0, [Validators.required]],
      maxPrice: [0, [Validators.required]],
      rooms: [0, [Validators.required]],
      amenities: this.fb.array([]), // <-- Se inicializa vacío
      zones: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(3)]]
    });

  }

  ngOnInit(): void {

    const state = this.router.lastSuccessfulNavigation?.extras?.state as { filterHomeArray?: Property[] };
    const propertiesArray = state?.filterHomeArray;

    this.loadFilterProperties(propertiesArray as Property[])

    this.loadAmenities()

    this.loadAvailablesOperationTypes()

    this.loadPropertyTypes()

    this.loadZones()


    this.imageNotFound = this.imgService.getNotFound() // Load the not found image


  }

  loadFilterProperties(propertiesArray: Property[]) {
    if (propertiesArray && propertiesArray.length > 0) {
      this.properties = propertiesArray;
      this.properties.forEach((value) => this.choiceMainImage(value))
      this.isFilter = true
      console.log("Properties load from filter.");
    }
    else {
      this.loadProperties()
      console.log("Properties load from database.");
      this.isFilter = false;
    }
  }

  loadAvailablesOperationTypes() {
    this.propertyService.getAvailablesOperationTypes().subscribe({
      next: (data) => {
        this.operationTypes = data;
      },
      error: (e) => console.log(e)
    });
  }

  loadAmenities() {
    this.propertyService.getAvailableAmenities().subscribe({
      next: (data) => {
        this.amenities = data;

        const amenityControls = this.amenities.map(() => this.fb.control(false));

        this.form.setControl('amenities', this.fb.array(amenityControls));
      },
      error: (e) => console.log(e)
    });
  }

  loadZones() {
    this.propertyService.getAvailableZones().subscribe({
      next: (data) => {
        this.zones = data;
      },
      error: (e) => console.log(e)
    });
  }

  loadPropertyTypes() {
    this.propertyService.getAvailablePropertyTypes().subscribe({
      next: (data) => {
        this.propertyTypes = data;
      },
      error: (e) => console.log(e)
    });
  }

  setRoomsValuee(value: number) {
    this.form.get('rooms')?.setValue(value);
    this.numberRoomsSelect = value
  }

  filterClear() {
    const defaultValues = {
      operationTypes: '',
      propertyTypes: '',
      zones: '',
      minPrice: 0,
      maxPrice: 0,
      rooms: 0,
      // 💡 Esto sigue estando bien, reinicia el FormArray
      amenities: this.amenities.map(() => false)
    };

    this.form.reset(defaultValues);
    this.numberRoomsSelect = 0

    this.loadProperties()
    this.isFilter = false;
  }

  loadProperties() {
    this.propertyService.getAll().subscribe({
      next: (data) => {
        this.properties = data
        this.properties.forEach((value) => this.choiceMainImage(value))
      },
      error: (e) => console.log(e)
    })
  }

  choiceMainImage(p: Property) {
    if (!p.imageDTOList || p.imageDTOList.length == 0) p.mainImage = this.imageNotFound; // If the image array is null or empty, we load the not found image in the cards
    else if (!p.imageDTOList.find(img => img.name.includes("Portada"))) p.mainImage = p.imageDTOList[0].url // If the image array don't has any image with 'portada' name, load any image
    else p.mainImage = p.imageDTOList.find(img => img.name.includes("Portada"))?.url // If the image array has the 'portada' image, it returs
  }

  onSumbit() {
    // Tu lógica de onSumbit para leer el FormArray está CORRECTA.
    const formValue = this.form.value;

    const selectedBooleans: boolean[] = formValue.amenities;

    const selectedAmenitiesDTO: Amenity[] = this.amenities
      .filter((amenity, index) => selectedBooleans[index]);

    const filterResult = {
      operationTypeDTOList: [
        { "operationName": formValue.operationTypes }
      ],
      propertyTypeDTOList: [
        { "typeName": formValue.propertyTypes }
      ],
      zoneDTOList: [
        { "zoneName": formValue.zones }
      ],
      minPrice: formValue.minPrice,
      maxPrice: formValue.maxPrice,
      rooms: formValue.rooms,
      amenityDTOList: selectedAmenitiesDTO
    } as PropertiesFilter

    this.propertyService.applyFilter(filterResult).subscribe({
      next: (data) => {
        this.loadFilterProperties(data)
        this.isFilter = true
      },
      error: (e) => console.log(e)
    })
  }

}


