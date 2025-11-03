import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import OperationType from '../../models/property/OperationType';
import Property from '../../models/property/Property';
import { PropertyService } from '../../services/propertyServices/property/property-service';
import { ImgBbService } from '../../services/propertyServices/imgBB/img-bb-service';
import Amenity from '../../models/property/Amenity';
import HomeFilter from '../../models/property/HomeFilter';
import PropertiesFilter from '../../models/property/PropertiesFilter';

@Component({
  selector: 'app-properties',
  imports: [ReactiveFormsModule],
  templateUrl: './properties.html',
  styleUrl: './properties.css'
})
export class Properties implements OnInit {

  form!: FormGroup

  properties!: Property[]

  operationTypes!: OperationType[]
  finalOperations: OperationType[] = []

  amenities!: Amenity[]
  finalamenities: Amenity[] = []

  numberRooms: number[] = [1, 2, 3, 4]
  numberRoomsSelect!: number




  imageNotFound!: string

  constructor(
    private propertyService: PropertyService,
    private imgService: ImgBbService,
    private fb: FormBuilder

  ) { }

  ngOnInit(): void {

    this.formInitializer()

    this.loadProperties()

    this.loadAvailablesOperationTypes()

    this.loadAmenities()

    this.imageNotFound = this.imgService.getNotFound() // Load the not found image


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
      },
      error: (e) => console.log(e)
    });
  }

  setRoomsValuee(value: number) {
    this.form.get('rooms')?.setValue(value);
    this.numberRoomsSelect = value
  }

  filterClear() {
    this.form.reset()
    this.form.markAsPristine()
    this.form.markAsUntouched()
    this.numberRoomsSelect = 0
  }

  formInitializer() {
    this.form = this.fb.group({
      operationType: ['', [Validators.required]],
      minPrice: [0, [Validators.required]],
      maxPrice: [0, [Validators.required]],
      rooms: [0, [Validators.required]],
      amenities: ['', [Validators.required]]
    });
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

  applyFilters() {
    console.log(this.amenities)


    const filters = this.form.value
    console.log(filters)
    this.propertyService.applyFilter()
  }

  addOrDeleteAmenitiesCheckBox(value: string, select: boolean) {

    if (select) {
      const amenity = {
        amenityName: value
      } as Amenity
      this.finalamenities.push(amenity)
    } else {

      const indexToDelete = this.finalamenities.findIndex(
        (item) => item.amenityName === value
      );

      if (indexToDelete > -1) {

        this.finalamenities.splice(indexToDelete, 1);
        console.log(`Eliminada amenity: ${value}`);
      } else {
        console.log(`Advertencia: Amenity ${value} no encontrada.`);
      }
    }

    console.log('Estado actual del array:', this.finalamenities);
  }

    addOrDeleteOperationTypesCheckBox(value: string, select: boolean) {

    if (select) {
      const operation = {
        operationName: value
      } as OperationType
      this.finalOperations.push(operation)
    } else {

      const indexToDelete = this.finalOperations.findIndex(
        (item) => item.operationName === value
      );

      if (indexToDelete > -1) {

        this.finalOperations.splice(indexToDelete, 1);
        console.log(`Eliminada operation: ${value}`);
      } else {
        console.log(`Warning: Operation ${value} not found.`);
      }
    }

    console.log('Estado actual del array:', this.finalOperations);
  }

  onSumbit() {
    this.form.setValue({
      operationType: this.finalOperations,
      minPrice: this.form.get('minPrice')?.value,
      maxPrice: this.form.get('maxPrice')?.value,
      rooms: this.form.get('rooms')?.value,
      amenities: this.finalamenities,
    })
    const valueForm = this.form.value
    console.log(valueForm)


  }

}


