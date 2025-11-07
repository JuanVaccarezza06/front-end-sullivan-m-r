import { Component, effect, EventEmitter, Input, input, OnChanges, OnDestroy, OnInit, output, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Property from '../../models/property/Property';
import OperationType from '../../models/property/OperationType';
import PropertyType from '../../models/property/PropertyType';
import Zone from '../../models/property/Zone';
import Amenity from '../../models/property/Amenity';
import { PropertyService } from '../../services/propertyServices/property/property-service';
import { ImgBbService } from '../../services/propertyServices/imgBB/img-bb-service';
import { Router } from '@angular/router';
import PropertiesFilter from '../../models/property/PropertiesFilter';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-filter-properties-page',
  imports: [ReactiveFormsModule],
  templateUrl: './filter-properties-page.html',
  styleUrl: './filter-properties-page.css'
})
export class FilterPropertiesPage implements OnInit, OnDestroy {

  form: FormGroup


  operationTypes!: OperationType[]

  propertyTypes: PropertyType[] = []

  zones: Zone[] = []

  amenities: Amenity[] = []
  finalamenities: Amenity[] = []

  numberRooms: number[] = [1, 2, 3, 4]
  numberRoomsSelect!: number

  thereIsFilter = output<Property[]>();
  filterClean = output<void>();

  @Input() resetTrigger!: EventEmitter<void>;
  private sub?: Subscription

  constructor(
    private propertyService: PropertyService,
    private fb: FormBuilder,
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
    this.loadAmenities()
    this.loadAvailablesOperationTypes()
    this.loadPropertyTypes()
    this.loadZones()

    this.sub = this.resetTrigger.subscribe(() => this.filterClear())
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    
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

    this.filterClean.emit()
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
    }

    this.propertyService.applyFilter(filterResult).subscribe({
      next: (data) => {
        this.thereIsFilter.emit(data)
      },
      error: (e) => console.log(e)
    })
  }

} 
