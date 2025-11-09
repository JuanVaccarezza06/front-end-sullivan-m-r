import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import OperationType from '../../models/property/OperationType';
import PropertyType from '../../models/property/PropertyType';
import { InputAmenities } from '../input-amenities/input-amenities';
import { InputImages } from '../input-images/input-images';
import { PageResponse } from '../../models/pagable/PageResponse';
import Property from '../../models/property/Property';
import { PropertyService } from '../../services/propertyServices/property/property-service';
import Zone from '../../models/property/Zone';

@Component({
  selector: 'app-form-property',
  imports: [ReactiveFormsModule, InputAmenities, InputImages],
  templateUrl: './form-property.html',
  styleUrl: './form-property.css'
})
export class FormProperty implements OnInit {

  operationsTypesArray: OperationType[] = []
  propertyTypesArray: PropertyType[] = []

  zones: Zone[] = []

  form!: FormGroup

  constructor(
    private fb: FormBuilder,
    private service : PropertyService
  ) { }

  ngOnInit(): void {
    this.formInitilizer()
  }

  formInitilizer() {

    const countryForm = this.fb.group({
      countryName: ['', Validators.required]
    });

    const provinceForm = this.fb.group({
      provinceName: ['', Validators.required],
      countryDTO: countryForm
    });

    const cityForm = this.fb.group({
      cityName: ['', Validators.required],
      provinceDTO: provinceForm
    });

    const zoneForm = this.fb.group({
      zoneName: ['', Validators.required],
      cityDTO: cityForm
    });

    const addressForm = this.fb.group({
      mainStreet: ['', Validators.required],
      secondaryStreet: ['', Validators.required],
      numbering: [0, [Validators.required, Validators.min(1)]]
    });

    const ownerForm = this.fb.group({
      firstName: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      numberPhone: ['', Validators.required]
    });


    const propertyForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: [0.00, [Validators.required, Validators.min(0.01)]],
      publicationDate: ['', Validators.required], // Usar un Date picker o formato string
      yearConstruction: [2000, [Validators.required, Validators.min(1800), Validators.max(new Date().getFullYear())]],
      areaStructure: [0.0, [Validators.required, Validators.min(0.01)]],
      totalArea: [0.0, [Validators.required, Validators.min(0.01)]],
      rooms: [0, [Validators.required, Validators.min(0)]],
      bathrooms: [0, [Validators.required, Validators.min(0)]],
      bedrooms: [0, [Validators.required, Validators.min(0)]],

      propertyTypeDTO: this.fb.group({
        typeName: ['', Validators.required]
      }),
      operationTypeDTO: this.fb.group({
        operationName: ['', Validators.required]
      }),
      zoneDTO: zoneForm,
      addressDTO: addressForm,
      ownerDTO: ownerForm,

      amenitiesList: this.fb.array([
      ]),
      imageDTOList: this.fb.array([
      ])
    });
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
