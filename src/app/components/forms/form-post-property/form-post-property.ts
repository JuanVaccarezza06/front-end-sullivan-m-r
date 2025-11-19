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
import { FormZone } from '../sub-forms/form-zone/form-zone';
import { FormAddress } from '../sub-forms/form-address/form-address';
import { FormOwner } from '../sub-forms/form-owner/form-owner';
import Amenity from '../../../models/property/complements/Amenity';
import Image from '../../../models/property/complements/Image';
import { ActivatedRoute, Route, Router } from '@angular/router';


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
export class FormPostProperty implements OnInit {

  operationsTypesArray: OperationType[] = []
  propertyTypesArray: PropertyType[] = []

  form!: FormGroup

  isUpdate!: boolean
  propertyUpdate!: Property

  // Supongamos que tienes 3 hijos en tu HTML (o el length de tu array si es *ngFor)
  totalChildren = 3;

  // Un contador que empieza en 0
  finishedChildrenCount = 0;

  // Variable para disparar a los hijos (tu signal)
  startSignal = 0;

  constructor(
    private fb: FormBuilder,
    private service: PropertyService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.formInitilizer()
    this.loadAvailablesOperationTypes()
    this.loadPropertyTypes()

    const state = this.router.lastSuccessfulNavigation?.extras?.state as { info?: Property };
    let property = state?.info || undefined;

    if (property) {
      this.propertyUpdate = property
      this.isUpdate = true
      this.patchValues()
    }

  }

  formInitilizer() {

    this.form = this.fb.group({
      id: [null],
      title: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(50),
        Validators.pattern(/^\S+\s+\S+\s+\S+.*$/)]
      ],
      description: ['', [
        Validators.required,
        Validators.minLength(30),
        Validators.maxLength(300),]
      ],
      price: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(1000000000)]
      ],
      publicationDate: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(3000)]
      ], // Usar un Date picker o formato string
      yearConstruction: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(1000000000)]
      ],
      areaStructure: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(1000000000)]
      ],
      totalArea: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(1000000000)]
      ],
      rooms: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(1000000000)]
      ],
      bathrooms: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(1000000000)]
      ],
      bedrooms: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(1000000000)]
      ],

      propertyTypes: ['', [Validators.required,]],
      operationTypes: ['', [Validators.required]],

      zone: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)]
      ],
      city: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)]
      ],
      province: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)]
      ],
      country: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)]
      ],

      mainStreet: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)]
      ],
      secondaryStreet: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)]
      ],
      numbering: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(1000000000)]
      ],

      firstName: ['', [
        Validators.required,
        Validators.maxLength(100),
        Validators.minLength(3)]
      ],
      surname: ['', [
        Validators.required,
        Validators.maxLength(100),
        Validators.minLength(3)]]
      ,
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(254),
        Validators.minLength(6)]
      ],
      numberPhone: ['', [
        Validators.required,
        Validators.pattern(/^\+?[0-9\s\-]+$/),
        Validators.maxLength(20),
        Validators.minLength(3)]
      ],
      amenities: ['', [Validators.required]],
      images: ['', []],
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

  checkInvalidControls() {
    const controls = this.form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        console.log(`❌ Campo Inválido: [${name}]`);
        console.log('   Errores:', controls[name].errors);
        console.log('   Valor actual:', controls[name].value);
      }
    }
  }

  loadPropertyTypes() {
    this.service.getAvailablePropertyTypes().subscribe({
      next: (data) => {
        this.propertyTypesArray = data;
      },
      error: (e) => console.log(e)
    });
  }

  startProcess() {
    // 1. Reseteamos el contador por si acaso
    this.finishedChildrenCount = 0;

    // 2. Avisamos a los hijos que arranquen (tu lógica actual)
    this.startSignal++;
  }

  onOneChildFinished() {

    // 1. Sumamos uno al contador
    this.finishedChildrenCount++;
    console.log(`Terminó un hijo. Llevamos ${this.finishedChildrenCount} de ${this.totalChildren}`);

    // 2. Preguntamos: ¿Ya están todos?
    if (this.finishedChildrenCount === this.totalChildren) {
      this.finishSubmit();
    }
  }

  finishSubmit() {

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

    let finalAmenities = this.form.get('amenities')?.value as Amenity[]
    let finalImages = this.form.get('images')?.value as Image[]

    let result = {
      id: this.isUpdate ? this.propertyUpdate.id : null,
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

      propertyTypeDTO: {
        "typeName": this.form.get('propertyTypes')?.value
      },
      operationTypeDTO: {
        "operationName": this.form.get('operationTypes')?.value,
      },

      zoneDTO: finalZone,

      addressDTO: {
        "mainStreet": this.form.get('mainStreet')?.value,
        "secondaryStreet": this.form.get('secondaryStreet')?.value,
        "numbering": this.form.get('numbering')?.value,
      },

      ownerDTO: {
        "firstName": this.form.get('firstName')?.value,
        "surname": this.form.get('surname')?.value,
        "email": this.form.get('email')?.value,
        "numberPhone": this.form.get('numberPhone')?.value
      },

      amenitiesList: finalAmenities,
      imageDTOList: finalImages
    }

    console.log(result)

    if (this.isUpdate) this.service.put(result)?.subscribe({
      next: (data) => { }
      ,
      error: (e) => console.log(e)
    })
    else this.service.post(result)?.subscribe({
      next: (data) => console.log(data),
      error: (e) => console.log(e)
    })


  }

  patchValues() {

    let result = {
      id: this.propertyUpdate.id,
      title: this.propertyUpdate.title,
      description: this.propertyUpdate.description,
      price: this.propertyUpdate.price,
      publicationDate: this.propertyUpdate.publicationDate,
      yearConstruction: this.propertyUpdate.yearConstruction,
      areaStructure: this.propertyUpdate.areaStructure,
      totalArea: this.propertyUpdate.totalArea,
      rooms: this.propertyUpdate.rooms,
      bathrooms: this.propertyUpdate.bathrooms,
      bedrooms: this.propertyUpdate.bedrooms,

      propertyTypes: this.propertyUpdate.propertyTypeDTO.typeName,

      operationTypes: this.propertyUpdate.operationTypeDTO.operationName,

      zone: this.propertyUpdate.zoneDTO.zoneName,
      city: this.propertyUpdate.zoneDTO.cityDTO.cityName,
      province: this.propertyUpdate.zoneDTO.cityDTO.provinceDTO.provinceName,
      country: this.propertyUpdate.zoneDTO.cityDTO.provinceDTO.countryDTO.countryName,

      mainStreet: this.propertyUpdate.addressDTO.mainStreet,
      secondaryStreet: this.propertyUpdate.addressDTO.secondaryStreet,
      numbering: this.propertyUpdate.addressDTO.numbering,

      firstName: this.propertyUpdate.ownerDTO.firstName,
      surname: this.propertyUpdate.ownerDTO.surname,
      email: this.propertyUpdate.ownerDTO.email,
      numberPhone: this.propertyUpdate.ownerDTO.numberPhone,

      amenities: this.propertyUpdate.amenitiesList,
      images: this.propertyUpdate.imageDTOList
    }

    this.form.patchValue(result)
  }

  cargarValores() {

    let result = {
      title: 'Espectacular Casa en el Centro', // > 10 chars
      description: 'Esta es una descripción de prueba lo suficientemente larga para superar la validación de 30 caracteres obligatoria del sistema.', // > 30 chars
      price: 250000,
      publicationDate: '2025-11-19',
      yearConstruction: 2020,
      areaStructure: 150,
      totalArea: 300,
      rooms: 5,
      bathrooms: 2,
      bedrooms: 3,

      // Asegúrate que estos valores existan en tus <select> o arrays cargados
      propertyTypes: 'Casa',
      operationTypes: 'Venta',

      zone: 'Playa Grande',
      city: 'Mar del Plata',
      province: 'Buenos Aires',
      country: 'Argentina',

      mainStreet: 'Av. Colón',
      secondaryStreet: 'Calle Güemes',
      numbering: '1234',

      firstName: 'Juan Pablo',
      surname: 'Rodriguez',
      email: 'juan.prueba@gmail.com',
      numberPhone: '+54 9 223 5559999', // Cumple el pattern con + y espacios

    }
    // Aplicar al formulario
    this.form.patchValue(result);
  }



}
