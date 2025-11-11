import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputAmenities } from '../sub-forms/input-amenities/input-amenities';
import { InputImages } from '../sub-forms/input-images/input-images';
import OperationType from '../../../models/property/types/OperationType';
import PropertyType from '../../../models/property/types/PropertyType';
import ZoneDTO from '../../../models/property/geography/Zone';
import { PropertyService } from '../../../services/propertyServices/property/property-service';
import Property from '../../../models/property/Property';
import { PageResponse } from '../../../models/pagable/PageResponse';
import Amenity from '../../../models/property/complements/Amenity';
import { FormZone } from '../sub-forms/form-zone/form-zone';
import { FormAddress } from '../sub-forms/form-address/form-address';
import { FormOwner } from '../sub-forms/form-owner/form-owner';


@Component({
  selector: 'app-form-property',
  imports: [ReactiveFormsModule,
    InputAmenities,
    InputImages,
    FormZone,
    FormAddress,
    FormOwner
  ],
  templateUrl: './form-post-property.html',
  styleUrl: './form-post-property.css',
})
export class FormProperty implements OnInit {

  operationsTypesArray: OperationType[] = []
  propertyTypesArray: PropertyType[] = []

  form!: FormGroup

  constructor(
    private fb: FormBuilder,
    private service: PropertyService
  ) { }

  ngOnInit(): void {
    this.formInitilizer()

    this.loadAvailablesOperationTypes()
    this.loadPropertyTypes()
  }

  formInitilizer() {

    this.form = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: [0.00, [Validators.required]],
      publicationDate: ['', Validators.required], // Usar un Date picker o formato string
      yearConstruction: [2000, [Validators.required]],
      areaStructure: [0.0, [Validators.required]],
      totalArea: [0.0, [Validators.required]],
      rooms: [0, [Validators.required]],
      bathrooms: [0, [Validators.required]],
      bedrooms: [0, [Validators.required]],

      propertyTypes: ['', Validators.required],
      operationTypes: ['', Validators.required],

      zone: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      country: ['', Validators.required],

      mainStreet: ['', Validators.required],
      secondaryStreet: ['', Validators.required],
      numbering: ['', [Validators.required]],

      firstName: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required]],
      numberPhone: ['', Validators.required],
      // amenities: this.fb.array([])
      // imageDTOList: this.fb.array([
      // ])
    });
  }

  loadAvailablesOperationTypes() {
    this.service.getAvailablesOperationTypes().subscribe({
      next: (data) => {
        this.operationsTypesArray = data;
      },
      error: (e) => console.log(e)
    });
  }

  loadPropertyTypes() {
    this.service.getAvailablePropertyTypes().subscribe({
      next: (data) => {
        this.propertyTypesArray = data;
      },
      error: (e) => console.log(e)
    });
  }

  onSubmit() {
    // // It get a boolean array order by the original values from the amenitiesArray
    // const selectedBooleans: boolean[] = this.form.get('amenities')?.value;
    // // It transform or parse the booleans to amenity real info!! So easy but complex
    // let selectedAmenitiesDTO: Amenity[] = this.amenitiesArray
    //   .filter((amenity, index) => selectedBooleans[index]);

    let finalZone = {
      "zoneName": this.form.get('zone')?.value,
      "cityDTO": {
        "cityName": this.form.get('city')?.value,
        "provinceDTO": {
          "provinceName": this.form.get('province')?.value,
          "countryDTO": {
            "countryName": this.form.get('country')?.value
          }
        }
      }
    } as ZoneDTO

  let result = {
    id: null,
    title: this.form.get('title')?.value,
    description: this.form.get('description')?.value,
    price: this.form.get('price')?.value,
    publicationDate: "",
    yearConstruction: this.form.get('yearConstruction')?.value,
    areaStructure: this.form.get('areaStructure')?.value,
    totalArea: this.form.get('totalArea')?.value,
    rooms: this.form.get('rooms')?.value,
    bathrooms: this.form.get('bathrooms')?.value,
    bedrooms: this.form.get('bedrooms')?.value,

    propertyTypes: this.form.get('propertyTypes')?.value,
    operationTypes: this.form.get('operationTypes')?.value,

    zone: finalZone,

    mainStreet: this.form.get('mainStreet')?.value,
    secondaryStreet: this.form.get('secondaryStreet')?.value,
    numbering: this.form.get('numbering')?.value,

    firstName: this.form.get('firstName')?.value,
    surname: this.form.get('surname')?.value,
    email: this.form.get('email')?.value,
    numberPhone: this.form.get('numberPhone')?.value,

    // amenities: selectedAmenitiesDTO
  }
  console.log(result)
}

getAllTest() {
  let requestResponse: PageResponse<Property>

  this.service.getAll(0).subscribe({
    next: (data) => {
      requestResponse = data
      if (requestResponse) console.log("La data NO es nula.")
      if (requestResponse.content) console.log("El contenido no es nulo NO es nula.")
      if (requestResponse) console.log(requestResponse.totalPages)
      console.log(requestResponse)
    },
    error: (e) => console.log(e)
  })
}

}
