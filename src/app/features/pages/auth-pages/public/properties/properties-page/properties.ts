import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

// Models
import Property from '../../../../../../core/models/properties/Property';
import ZoneDTO from '../../../../../../core/models/geography/Zone';
import PropertiesFilter from '../../../../../../core/models/PropertiesFilter';

// Services
import { PropertyService } from '../../../../../../core/services/property-service/property-service';
import { ImgBbService } from '../../../../../../core/services/imgbb-service/img-bb-service';
import { AmenityService } from '../../../../../../core/services/amenity-service/amenity-service';

// Components
import { AdapterItem } from '../../../../../../shared/components/ui/adapter-item/adapter-item';
import { ZoneService } from '../../../../../../core/services/zone-service/zone-service';
import { AuthService } from '../../../../../../core/auth-service/auth-service';
import Amenity from '../../../../../../core/models/Amenity';
import OperationType from '../../../../../../core/models/OperationType';
import PropertyType from '../../../../../../core/models/PropertyType';
import { ConfigurationType } from '../../../../../../core/models/ConfigurationType';

@Component({
  selector: 'app-properties',
  imports: [ReactiveFormsModule, AdapterItem],
  templateUrl: './properties.html',
  styleUrl: './properties.css',
})
export class Properties implements OnInit {
  form!: FormGroup;

  priceRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const min = control.get('minPrice')?.value;
    const max = control.get('maxPrice')?.value;

    if (min !== null && max !== null && max > 0 && min > max) {
      return { rangeError: true };
    }

    return null;
  };

  // Reference to the child. Note: When using @if in HTML, this may be undefined at the beginning.
  @ViewChild(AdapterItem) childComponent!: AdapterItem;

  // Data Objects
  properties: Property[] = [];
  amenitiesArray: Amenity[] = [];
  amenitiesArrayFeatured: Amenity[] = []; // This will be automatically passed to the child via HTML.

  operationTypesArray: OperationType[] = [];
  propertyTypesArray: PropertyType[] = [];
  zoneArray: ZoneDTO[] = [];
  zoneArrayFeatured: ZoneDTO[] = [];

  filterResult!: PropertiesFilter;

  // Control variables
  numberRooms: number[] = [1, 2, 3, 4, 5];
  numberRoomsSelect!: number;

  minPrices: number[] = [0, 50000, 100000, 200000, 300000, 400000, 500000];
  maxPrices: number[] = [600000, 700000, 800000, 900000, 10000000];

  adminMode: boolean = false;
  isFilter: boolean = false;
  filterFailed: boolean = false;
  zoneConfiguration: boolean = false;

  imageNotFound!: string;

  // Pagination
  numberPagesInDatabase: number = 0;
  numberOfPropertiesLoadInArray: number = 0;
  pageSelected: number = 0;
  lastPage: number = 0;

  constructor(
    private propertyService: PropertyService,
    private amenityService: AmenityService,
    private zoneService: ZoneService,
    private imgService: ImgBbService,
    private router: Router,
    private fb: FormBuilder,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.formInitializer();

    this.loadAmenities();
    this.loadAvailablesOperationTypes();
    this.loadPropertyTypes();
    this.loadZones();

    this.imageNotFound = this.imgService.getNotFound();

    // VERIFICACIÓN DEL ESTADO (Router)
    const state = this.router.lastSuccessfulNavigation?.extras?.state as {
      homeResponse?: any; // Usamos 'any' o la interfaz HatoasPageResponse
    };
    const homeResponseIntoConst = state?.homeResponse;

    if (homeResponseIntoConst === undefined) {
      // Caso normal: Carga inicial sin filtro
      this.loadProperties();
    } else if (homeResponseIntoConst === false) {
      // Caso: Filtro fallido desde Home
      this.filterFailed = true;
      this.isFilter = true;
    } else {
      // CASO: VIENE CON DATOS DEL HOME (HATEOAS)
      const response = homeResponseIntoConst;

      // 1. Extraemos la lista de _embedded
      const content = response._embedded ? response._embedded.propertyDTOList : [];

      // 2. Actualizamos la paginación (Importante para que coincidan los números)
      // Usamos ?. por seguridad, aunque debería venir
      const totalPages = response.page?.totalPages ?? 0;
      const pageNumber = response.page?.number ?? 0;

      this.updatePageInfo(totalPages - 1, pageNumber, content);

      // 3. Renderizamos
      this.loadPropertiesFromHome(content);
    }
  }

  formInitializer() {
    this.form = this.fb.group(
      {
        operationTypes: ['', [Validators.required]],
        propertyTypes: ['', [Validators.required]],

        // Cambiamos a null o '' inicial para que el input salga vacío y limpio
        // Agregamos Validators.min(0) para que no pongan números negativos
        minPrice: [null, [Validators.min(0)]],
        maxPrice: [null, [Validators.min(0)]],

        rooms: [0, [Validators.required]],
        amenities: this.fb.array([]),
        zone: ['', [Validators.required]],
      },
      { validators: this.priceRangeValidator }
    ); // <--- AQUÍ SE APLICA LA VALIDACIÓN CRUZADA
  }

  // ==========================================
  // LOADING DATA METHODS
  // ==========================================

  loadProperties() {
    this.propertyService.getAll(this.pageSelected).subscribe({
      next: (data) => {
        this.isFilter = false;
        console.log(data);

        // CAMBIOS AQUÍ:
        // 1. La data real ahora está dentro de _embedded.propertyDTOList
        const content = data._embedded ? data._embedded['propertyDTOList'] : [];

        // 2. La info de paginación está dentro de data.page
        this.updatePageInfo(data.page.totalPages - 1, data.page.number, content);

        this.properties.forEach((value) => this.choiceMainImage(value));
        console.log('Properties load from database via HATEOAS.');
      },
      error: (e) => console.log(e),
    });
  }

  loadPropertiesFromHome(propertiesArray: Property[]) {
    if (propertiesArray && propertiesArray.length > 0) {
      this.isFilter = true;
      this.properties = propertiesArray;
      this.properties.forEach((value) => this.choiceMainImage(value));
      this.numberOfPropertiesLoadInArray = this.properties.length;
      console.log('Properties load from filter.');
    } else {
      console.log('The properties that came from home are undefined (array null)');
    }
  }

  loadAmenities() {
    this.amenityService.getAll().subscribe({
      next: (data) => {
        this.amenitiesArray = data;

        // I filter the featured items
        const featuredTemp = this.amenitiesArray.filter((value) => value.isFeatured);

        // I updated the filter form (left).
        this.updateAmenitiesForm(featuredTemp);

        // I update the variable.
        // ALERT: Angular will detect this change and automatically pass it to the child via [amenitiesArrayFeatured] in the HTML.
        this.amenitiesArrayFeatured = featuredTemp;
      },
      error: (e) => console.log(e),
    });
  }

  loadAvailablesOperationTypes() {
    this.propertyService.getAvailablesOperationTypes().subscribe({
      next: (data) => (this.operationTypesArray = data),
      error: (e) => console.log(e),
    });
  }

  loadZones() {
    this.zoneService.getAll().subscribe({
      next: (data) => {
        this.zoneArray = data;
        this.zoneArrayFeatured = this.zoneArray.filter((value) => value.isFeatured);
      },
      error: (e) => console.log(e),
    });
  }

  loadPropertyTypes() {
    this.propertyService.getAvailablePropertyTypes().subscribe({
      next: (data) => (this.propertyTypesArray = data),
      error: (e) => console.log(e),
    });
  }

  // ==========================================
  // UTILS & PAGINATION
  // ==========================================

  choiceMainImage(p: Property) {
    if (!p.imageDTOList || p.imageDTOList.length == 0) {
      p.mainImage = this.imageNotFound;
    } else {
      const portada = p.imageDTOList.find((img) => img.name.includes('Portada'));
      p.mainImage = portada ? portada.url : p.imageDTOList[0].url;
    }
  }

  // changePage(signal: boolean) {
  //   const action = signal ? 1 : -1;
  //   const newPage = this.pageSelected + action;

  //   // Validate limits
  //   if (newPage < 0 || newPage > this.lastPage) return;

  //   this.pageSelected = newPage;

  //   if (this.isFilter) {
  //     this.propertyService.applyFilter(this.filterResult, this.pageSelected).subscribe({
  //       next: (data) => {
  //         this.updatePageInfo(data.totalPages - 1, data.number, data.content);
  //         this.properties.forEach((value) => this.choiceMainImage(value));
  //       },
  //     });
  //   } else {
  //     this.loadProperties();
  //   }
  // }

  changePage(isNext: boolean) {
    if (isNext) {
      // Si no es la última página, sumamos 1
      if (this.pageSelected < this.lastPage) {
        this.pageSelected++;
        this.loadProperties(); // Recargamos con el nuevo número
      }
    } else {
      // Si no es la primera página (asumiendo que 0 es la primera), restamos 1
      if (this.pageSelected > 0) {
        this.pageSelected--;
        this.loadProperties();
      }
    }
  }

  updatePageInfo(
    totalPageToUpdate: number,
    numberPageToUpdate: number,
    contentToUpdate: Property[]
  ) {
    this.lastPage = totalPageToUpdate;
    this.pageSelected = numberPageToUpdate;
    this.properties = contentToUpdate;
    this.numberOfPropertiesLoadInArray = this.properties.length;
  }

  resetPageInfo() {
    this.numberPagesInDatabase = 0;
    this.numberOfPropertiesLoadInArray = 0;
    this.pageSelected = 0;
    this.lastPage = 0;
  }

  detail(propertyToSee: Property) {
    return this.router.navigate(['properties', propertyToSee.id], {
      state: { propertyData: propertyToSee },
    });
  }

  // ==========================================
  // FORM & FILTER LOGIC
  // ==========================================

  setRoomsValue(value: number) {
    this.form.get('rooms')?.setValue(value);
    this.numberRoomsSelect = value;
  }

  getAmenitiesFormArray() {
    return this.form.get('amenities') as FormArray;
  }

  updateAmenitiesForm(amenitiesList: Amenity[] | null = null) {
    const amenitiesControl = this.getAmenitiesFormArray();
    if (amenitiesControl) {
      amenitiesControl.clear();
      const listToUse = amenitiesList || this.amenitiesArrayFeatured;
      listToUse.forEach(() => {
        amenitiesControl.push(this.fb.control(false));
      });
    }
  }

  onSubmit() {
    console.log('Starting onSubmit...');

    // 1. Safe extraction of amenities
    // Ensure we default to an empty array if the form control is null
    const selectedBooleans: boolean[] = this.form.get('amenities')?.value ?? [];

    // Map the true/false values to the actual Amenity objects
    // IMPORTANT: This assumes the index of the form array matches 'amenitiesArrayFeatured'
    const selectedAmenitiesDTO: Amenity[] = this.amenitiesArrayFeatured.filter(
      (_, index) => selectedBooleans[index] === true
    );

    // 2. Safe extraction of Zone
    const rawZone = this.form.get('zone')?.value;

    // Define a completely empty structure to avoid sending nulls deeply nested
    const defaultZone: ZoneDTO = {
      zoneName: '',
      cityDTO: {
        cityName: '',
        provinceDTO: {
          provinceName: '',
          countryDTO: {
            countryName: '',
          },
        },
      },
      isFeatured: false,
    };

    // If rawZone exists, map it; otherwise, use the default structure with empty strings
    const safeZoneDTO: ZoneDTO = rawZone
      ? {
          zoneName: rawZone.zoneName ?? '',
          cityDTO: {
            cityName: rawZone.cityDTO?.cityName ?? '',
            provinceDTO: {
              provinceName: rawZone.cityDTO?.provinceDTO?.provinceName ?? '',
              countryDTO: {
                countryName: rawZone.cityDTO?.provinceDTO?.countryDTO?.countryName ?? '',
              },
            },
          },
          isFeatured: rawZone.isFeatured ?? false,
        }
      : defaultZone;

    // 3. Construct the Filter Object
    // We strictly use '??' to ensure NO nulls are sent, only '' or 0.
    this.filterResult = {
      operationTypeDTO: {
        operationName: this.form.get('operationTypes')?.value ?? '',
      },
      propertyTypeDTO: {
        typeName: this.form.get('propertyTypes')?.value ?? '',
      },
      zoneDTO: safeZoneDTO,
      minPrice: this.form.get('minPrice')?.value ?? 0,
      maxPrice: this.form.get('maxPrice')?.value ?? 0,
      rooms: this.form.get('rooms')?.value ?? 0,
      amenityDTOList: selectedAmenitiesDTO,
    } as PropertiesFilter;

    this.executeFilterCall(this.filterResult);
  }

  // executeFilterCall(filterResult: PropertiesFilter) {
  //   // 4. UI State Updates
  //   this.resetPageInfo();
  //   this.isFilter = true;
  //   this.filterResult = filterResult;

  //   console.log('Filter payload to send:', this.filterResult);

  //   // 5. API Call
  //   this.propertyService.applyFilter(this.filterResult, this.pageSelected).subscribe({
  //     next: (data) => {
  //       // CASE: Results found
  //       if (data.content && data.content.length > 0) {
  //         this.updatePageInfo(data.totalPages - 1, data.number, data.content);
  //         this.properties.forEach((value) => this.choiceMainImage(value));

  //         this.filterFailed = false; // Important: Ensure error state is cleared
  //         console.log('Properties loaded successfully from filter');
  //       }
  //       // CASE: No results found (FIX ADDED HERE)
  //       else {
  //         console.log('Filter returned no results.');
  //         this.properties = []; // Clear the list
  //         this.filterFailed = true; // Trigger the "No properties found" UI
  //         this.numberOfPropertiesLoadInArray = 0;
  //         this.childComponent.showError('El item no tiene usos.');
  //       }
  //     },
  //     error: (e) => {
  //       console.error('Error applying filter:', e);
  //       // Optional: Handle visual error feedback here
  //       this.filterFailed = true;
  //     },
  //   });
  // }

  // properties.ts

  executeFilterCall(filterResult: PropertiesFilter) {
    // 1. Actualizamos estado visual
    this.resetPageInfo();
    this.isFilter = true;
    this.filterResult = filterResult;

    console.log('Filter payload to send:', this.filterResult);

    // 2. Llamada a la API
    this.propertyService.applyFilter(this.filterResult, this.pageSelected).subscribe({
      next: (data) => {
        // --- HATEOAS EXTRACTION ---
        // Si Spring no encuentra nada, a veces no manda _embedded.
        // Usamos el operador ternario para evitar errores.
        // IMPORTANTE: Spring suele llamar a la lista "propertyDTOList".
        const content = data._embedded ? data._embedded['propertyDTOList'] : [];

        // 3. Validamos si hay contenido
        if (content.length > 0) {
          // A. Caso Éxito: Hay propiedades

          // Extraemos la paginación del objeto 'page' de HATEOAS
          this.updatePageInfo(data.page.totalPages - 1, data.page.number, content);

          this.properties.forEach((value) => this.choiceMainImage(value));
          this.filterFailed = false;
          console.log('Properties loaded successfully from filter via HATEOAS');
        } else {
          // B. Caso Vacío: No hay propiedades
          console.log('Filter returned no results.');
          this.properties = [];
          this.filterFailed = true; // Activa el mensaje de error en el HTML
          this.numberOfPropertiesLoadInArray = 0;

          if (this.childComponent) {
            this.childComponent.showError('El filtro no arrojó resultados.');
          }
        }
      },
      error: (e) => {
        console.error('Error applying filter:', e);
        this.filterFailed = true;
      },
    });
  }

  filterFromOnSeeItem(filterResult: PropertiesFilter) {
    this.executeFilterCall(filterResult);
    this.adminMode = false;
  }

  clearFilter() {
    this.isFilter = false;
    this.filterFailed = false;

    this.form.patchValue({
      operationTypes: '',
      propertyTypes: '',
      zone: '',
      minPrice: 0,
      maxPrice: 0,
      rooms: 0,
    });

    this.numberRoomsSelect = 0; // Reset visual selection

    const amenitiesControl = this.getAmenitiesFormArray();
    if (amenitiesControl) {
      amenitiesControl.controls.forEach((control) => control.setValue(false));
    }

    this.resetPageInfo();
    this.loadProperties();
  }

  // ==========================================
  // CHILD COMPONENT INTERACTION (ADMIN)
  // ==========================================

  startSave(): void {
    console.log('Guardando configuración de amenities...');

    // Security check: if the child is not rendered (adminMode=false), we do nothing
    if (!this.childComponent) {
      console.error('El componente de configuración no está activo.');
      return;
    }

    this.childComponent.saveChanges();
  }

  updateDone(config: ConfigurationType) {
    if (config == ConfigurationType.AMENITY) this.loadAmenities();
    if (config == ConfigurationType.ZONE) this.loadZones();
    this.adminMode = false;
  }

  turnOffAdminMode() {
    this.adminMode = false;
  }
}
