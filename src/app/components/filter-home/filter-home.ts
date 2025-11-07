import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertyService } from '../../services/propertyServices/property/property-service';
import { Router } from '@angular/router';
import PropertiesFilter from '../../models/property/PropertiesFilter';
import Zone from '../../models/property/Zone';
import PropertyType from '../../models/property/PropertyType';
import OperationType from '../../models/property/OperationType';

@Component({
  selector: 'app-filter-home',
  imports: [ReactiveFormsModule],
  templateUrl: './filter-home.html',
  styleUrl: './filter-home.css'
})
export class FilterHome implements OnInit {

  form!: FormGroup
  zoneArray!: Zone[]
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
    this.form = this.fb.group({
      operationTypes: ['', [Validators.required]],
      propertyTypes: ['', [Validators.required]],
      zone: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(3)]]
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

}
