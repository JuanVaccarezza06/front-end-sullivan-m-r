import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import PropertyType from '../../../models/property/types/PropertyType';
import ZoneDTO from '../../../models/property/geography/Zone';
import OperationType from '../../../models/property/types/OperationType';
import { PropertyService } from '../../../services/propertyServices/property/property-service';
import PropertiesFilter from '../../../models/property/request-response/PropertiesFilter';


@Component({
  selector: 'app-filter-home',
  imports: [ReactiveFormsModule],
  templateUrl: './filter-home.html',
  styleUrl: './filter-home.css'
})
export class FilterHome implements OnInit {

  form!: FormGroup
  zoneArray!: ZoneDTO[]
  propertyTypesArray!: PropertyType[]

  operationTypeArray!: OperationType[]

  constructor(
    private service: PropertyService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {

    this.formInitializer()

    this.loadAvailablesZones();
    this.loadAvailablesOperationTypes();
    this.loadAvailablePropertyTypes();

  }

  formInitializer() {

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

    this.form = this.fb.group({
      operationTypes: ['', [Validators.required]],
      propertyTypes: ['', [Validators.required]],
      zone: [zoneForm, [Validators.required, Validators.maxLength(20), Validators.minLength(3)]]
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

  makeFilter() {

    const filterResult = {
      operationTypeDTO: { "operationName": this.form.get('operationTypes')?.value },
      propertyTypeDTO: { "typeName": this.form.get('propertyTypes')?.value },
      zoneDTO: {
          "zoneName": this.form.get('zone')?.value.zoneName,
          "cityDTO": {
            "cityName": this.form.get('zone')?.value.cityDTO.cityName,
            "provinceDTO": {
              "provinceName": this.form.get('zone')?.value.cityDTO.provinceDTO.provinceName,
              "countryDTO": {
                "countryName": this.form.get('zone')?.value.cityDTO.provinceDTO.countryDTO.countryName
              }
            }
          }
        },
      minPrice: 0,
      maxPrice: 0,
      rooms: 0,
      amenityDTOList: []
    } as PropertiesFilter

    this.service.applyFilter(filterResult).subscribe({
      next: (data) => {
        this.router.navigate(['properties'], {
          state: { filterHomeArray: data }
        })
      },
      error: (e) => console.log(e)
    })
  }


}
