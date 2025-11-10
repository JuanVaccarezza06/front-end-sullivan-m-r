import { Component, EventEmitter, Input, OnDestroy, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Property from '../../models/property/Property';
import OperationType from '../../models/property/types/OperationType';
import PropertyType from '../../models/property/types/PropertyType';
import Amenity from '../../models/property/complements/Amenity';
import { PropertyService } from '../../services/propertyServices/property/property-service';
import { Subscription } from 'rxjs';
import ZoneDTO from '../../models/property/geography/Zone';
import PropertiesFilter from '../../models/property/request-response/PropertiesFilter';

@Component({
  selector: 'app-filter-properties-page',
  imports: [ReactiveFormsModule],
  templateUrl: './filter-properties-page.html',
  styleUrl: './filter-properties-page.css'
})
export class FilterPropertiesPage implements OnInit, OnDestroy {

  form!: FormGroup

  operationTypesArray!: OperationType[]
  propertyTypesArray: PropertyType[] = []
  zoneArray: ZoneDTO[] = []
  amenitiesArray: Amenity[] = []

  numberRooms: number[] = [1, 2, 3, 4]
  numberRoomsSelect!: number

  thereIsFilter = output<Property[]>();
  filterClean = output<void>();

  @Input() resetTrigger!: EventEmitter<void>;
  private sub?: Subscription

  constructor(
    private propertyService: PropertyService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {

    this.formInitializer()

    this.loadAmenities()
    this.loadAvailablesOperationTypes()
    this.loadPropertyTypes()
    this.loadZones()

    this.sub = this.resetTrigger.subscribe(() => this.filterClear())
  }

  formInitializer() {

    this.form = this.fb.group({
      operationTypes: ['', [Validators.required]],
      propertyTypes: ['', [Validators.required]],
      minPrice: [0, [Validators.required]],
      maxPrice: [0, [Validators.required]],
      rooms: [0, [Validators.required]],
      amenities: this.fb.array([]),
      zone: ['', [Validators.required]],
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadAvailablesOperationTypes() {
    this.propertyService.getAvailablesOperationTypes().subscribe({
      next: (data) => {
        this.operationTypesArray = data;
      },
      error: (e) => console.log(e)
    });
  }


  loadAmenities() {
    this.propertyService.getAvailableAmenities().subscribe({
      next: (data) => {
        this.amenitiesArray = data;

        // It is a control form array, by every amenitie, will create an control in false.
        // The result is an form control with false, once false by amenitie.
        const amenityControls = this.amenitiesArray.map(() => this.fb.control(false));

        // The form array is setting into de form array from form group.
        this.form.setControl('amenities', this.fb.array(amenityControls));
      },
      error: (e) => console.log(e)
    });
  }

  loadZones() {
    this.propertyService.getAvailableZones().subscribe({
      next: (data) => {
        this.zoneArray = data;
      },
      error: (e) => console.log(e)
    });
  }

  loadPropertyTypes() {
    this.propertyService.getAvailablePropertyTypes().subscribe({
      next: (data) => {
        this.propertyTypesArray = data;
      },
      error: (e) => console.log(e)
    });
  }

  setRoomsValuee(value: number) {
    this.form.get('rooms')?.setValue(value);
    this.numberRoomsSelect = value
  }

  filterClear() {
    this.form.reset({
      operationTypes: '',
      propertyTypes: '',
      zone: '',
      minPrice: 0,
      maxPrice: 0,
      rooms: 0,
      amenities: this.amenitiesArray.map(() => false)
    });
    this.numberRoomsSelect = 0;
    this.filterClean.emit();
  }


  onSumbit() {

    // It get a boolean array order by the original values from the amenitiesArray
    const selectedBooleans: boolean[] = this.form.get('amenities')?.value;
    // It transform or parse the booleans to amenity real info!! So easy but complex
    let selectedAmenitiesDTO: Amenity[] = this.amenitiesArray
      .filter((amenity, index) => selectedBooleans[index]);

    console.log(selectedAmenitiesDTO);

    selectedAmenitiesDTO.length > 0 ? console.log("amenties no nulas") : selectedAmenitiesDTO = []


    let zoneValue = this.form.get('zone')?.value as ZoneDTO;

    // 1. Nivel 1: Asegurar que zoneValue sea un objeto (TÚ CÓDIGO AQUI ES PERFECTO)
    if (!zoneValue) {
      zoneValue = {
        "zoneName": "",
        "cityDTO": {
          "cityName": "",
          "provinceDTO": {
            "provinceName": "",
            "countryDTO": {
              "countryName": ""
            }
          }
        }
      } as ZoneDTO;
    } else {
      // 2. Nivel 2: Asegurar la existencia de OBJETOS y luego asegurar el valor final

      // Asegurar la cadena de nivel superior
      zoneValue.zoneName = zoneValue.zoneName ?? '';

      // Asegurar y sanear la CIUDAD
      // Si cityDTO no existe, lo creamos para que no falle el acceso a sus propiedades.
      zoneValue.cityDTO = zoneValue.cityDTO ?? { cityName: '', provinceDTO: {} };
      zoneValue.cityDTO.cityName = zoneValue.cityDTO.cityName ?? '';

      // Asegurar y sanear la PROVINCIA
      // Si provinceDTO no existe, lo creamos.
      zoneValue.cityDTO.provinceDTO = zoneValue.cityDTO.provinceDTO ?? { provinceName: '', countryDTO: {} };
      zoneValue.cityDTO.provinceDTO.provinceName = zoneValue.cityDTO.provinceDTO.provinceName ?? '';

      // Asegurar y sanear el PAÍS
      // Si countryDTO no existe, lo creamos.
      zoneValue.cityDTO.provinceDTO.countryDTO = zoneValue.cityDTO.provinceDTO.countryDTO ?? { countryName: '' };
      zoneValue.cityDTO.provinceDTO.countryDTO.countryName = zoneValue.cityDTO.provinceDTO.countryDTO.countryName ?? '';
    }

    // ¡Con este código, has minimizado drásticamente la posibilidad de errores y nulos!

    // Ahora, zoneValue es definitivamente un objeto con todas las propiedades aseguradas como ''
    const zoneDTOToSend: ZoneDTO = zoneValue;

    console.log("Zone DTO Seguro:", zoneDTOToSend);



    zoneValue.cityDTO.cityName ? console.log("City name no nulo") : zoneValue.cityDTO.cityName = ''
    zoneValue.cityDTO.provinceDTO.provinceName ? console.log("Province name no nulo") : zoneValue.cityDTO.provinceDTO.provinceName = ''
    zoneValue.cityDTO.provinceDTO.countryDTO.countryName ? console.log("Country name no nulo") : zoneValue.cityDTO.provinceDTO.countryDTO.countryName = ''

    const filterResult = {
      operationTypeDTO: { "operationName": this.form.get('operationTypes')?.value },
      propertyTypeDTO: { "typeName": this.form.get('propertyTypes')?.value },
      zoneDTO: zoneValue, // 👈 mantiene toda la jerarquía completa
      minPrice: this.form.get('minPrice')?.value,
      maxPrice: this.form.get('maxPrice')?.value,
      rooms: this.form.get('rooms')?.value,
      amenityDTOList: selectedAmenitiesDTO
    } as PropertiesFilter;

    console.log("Filter result: ", filterResult);

    this.propertyService.applyFilter(filterResult).subscribe({
      next: (data) => {
        this.thereIsFilter.emit(data)
      },
      error: (e) => console.log(e)
    });
  }


} 
