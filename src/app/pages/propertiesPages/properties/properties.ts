import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Models
import Property from '../../../models/property/Property';
import Amenity from '../../../models/property/complements/Amenity';
import ZoneDTO from '../../../models/property/geography/Zone';
import PropertyType from '../../../models/property/types/PropertyType';
import OperationType from '../../../models/property/types/OperationType';
import PropertiesFilter from '../../../models/property/request-response/PropertiesFilter';
import { PageResponse } from '../../../models/pagable/PageResponse';

// Services
import { PropertyService } from '../../../services/propertyServices/property/property-service';
import { ImgBbService } from '../../../services/propertyServices/imgBB/img-bb-service';
import { AmenityService } from '../../../services/propertyServices/amenity/amenity-service';

// Components
import { ConfigurationFilter } from '../../../components/configuration-filter/configuration-filter';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [ReactiveFormsModule, ConfigurationFilter],
  templateUrl: './properties.html',
  styleUrl: './properties.css'
})
export class Properties implements OnInit {

  form!: FormGroup;

  // Reference to the child. Note: When using @if in HTML, this may be undefined at the beginning.
  @ViewChild(ConfigurationFilter) childComponent!: ConfigurationFilter;

  // Data Objects
  properties: Property[] = [];
  amenitiesArray: Amenity[] = [];
  amenitiesArrayFeatured: Amenity[] = []; // This will be automatically passed to the child via HTML.

  operationTypesArray: OperationType[] = [];
  propertyTypesArray: PropertyType[] = [];
  zoneArray: ZoneDTO[] = [];

  filterResult!: PropertiesFilter;

  // Control variables
  numberRooms: number[] = [1, 2, 3, 4, 5];
  numberRoomsSelect!: number;

  minPrices: number[] = [0, 50000, 100000, 200000, 300000, 400000, 500000]
  maxPrices: number[] = [600000, 700000, 800000, 900000, 10000000]

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
    private imgService: ImgBbService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.formInitializer();

    this.loadAmenities();
    this.loadAvailablesOperationTypes();
    this.loadPropertyTypes();
    this.loadZones();

    this.imageNotFound = this.imgService.getNotFound();

    // Check routing state from Home
    const state = this.router.lastSuccessfulNavigation?.extras?.state as { homeResponse?: PageResponse<Property> | boolean };
    const homeResponseIntoConst = state?.homeResponse;

    if (homeResponseIntoConst === undefined) {
      this.loadProperties();
    } else if (homeResponseIntoConst === false) {
      this.filterFailed = true;
      this.isFilter = true;
    } else {
      const response = homeResponseIntoConst as PageResponse<Property>;
      this.loadPropertiesFromHome(response.content);
    }
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

  // ==========================================
  // LOADING DATA METHODS
  // ==========================================

  loadProperties() {
    this.propertyService.getAll(this.pageSelected).subscribe({
      next: (data) => {
        this.isFilter = false;
        this.updatePageInfo(data.totalPages - 1, data.number, data.content);
        this.properties.forEach((value) => this.choiceMainImage(value));
        console.log("Properties load from database.");
      },
      error: (e) => console.log(e)
    });
  }

  loadPropertiesFromHome(propertiesArray: Property[]) {
    if (propertiesArray && propertiesArray.length > 0) {
      this.isFilter = true;
      this.properties = propertiesArray;
      this.properties.forEach((value) => this.choiceMainImage(value));
      this.numberOfPropertiesLoadInArray = this.properties.length;
      console.log("Properties load from filter.");
    } else {
      console.log("The properties that came from home are undefined (array null)");
    }
  }

  loadAmenities() {
    console.log("Estoy en load amenities");
    this.propertyService.getAvailableAmenities().subscribe({
      next: (data) => {
        this.amenitiesArray = data;

        // I filter the featured items
        const featuredTemp = this.amenitiesArray.filter(value => value.isFeatured);

        // I updated the filter form (left).
        this.updateAmenitiesForm(featuredTemp);

        // I update the variable.
        // ALERT: Angular will detect this change and automatically pass it to the child via [amenitiesArrayFeatured] in the HTML.
        this.amenitiesArrayFeatured = featuredTemp;

      },
      error: (e) => console.log(e)
    });
  }

  loadAvailablesOperationTypes() {
    this.propertyService.getAvailablesOperationTypes().subscribe({
      next: (data) => this.operationTypesArray = data,
      error: (e) => console.log(e)
    });
  }

  loadZones() {
    this.propertyService.getAvailableZones().subscribe({
      next: (data) => this.zoneArray = data,
      error: (e) => console.log(e)
    });
  }

  loadPropertyTypes() {
    this.propertyService.getAvailablePropertyTypes().subscribe({
      next: (data) => this.propertyTypesArray = data,
      error: (e) => console.log(e)
    });
  }

  // ==========================================
  // UTILS & PAGINATION
  // ==========================================

  choiceMainImage(p: Property) {
    if (!p.imageDTOList || p.imageDTOList.length == 0) {
      p.mainImage = this.imageNotFound;
    } else {
      const portada = p.imageDTOList.find(img => img.name.includes("Portada"));
      p.mainImage = portada ? portada.url : p.imageDTOList[0].url;
    }
  }

  changePage(signal: boolean) {
    const action = signal ? 1 : -1;
    const newPage = this.pageSelected + action;

    // Validate limits
    if (newPage < 0 || newPage > this.lastPage) return;

    this.pageSelected = newPage;

    if (this.isFilter) {
      this.propertyService.applyFilter(this.filterResult, this.pageSelected).subscribe({
        next: (data) => {
          this.updatePageInfo(data.totalPages - 1, data.number, data.content);
          this.properties.forEach((value) => this.choiceMainImage(value));
        }
      });
    } else {
      this.loadProperties();
    }
  }

  updatePageInfo(totalPageToUpdate: number, numberPageToUpdate: number, contentToUpdate: Property[]) {
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
    return this.router.navigate(['property-detail'], {
      state: { propertyData: propertyToSee }
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
    console.log("Starting onSubmit...");

    // 1. Safe extraction of amenities
    // Ensure we default to an empty array if the form control is null
    const selectedBooleans: boolean[] = this.form.get('amenities')?.value ?? [];

    // Map the true/false values to the actual Amenity objects
    // IMPORTANT: This assumes the index of the form array matches 'amenitiesArrayFeatured'
    const selectedAmenitiesDTO: Amenity[] = this.amenitiesArrayFeatured
      .filter((_, index) => selectedBooleans[index] === true);

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
            countryName: ''
          }
        }
      }
    };

    // If rawZone exists, map it; otherwise, use the default structure with empty strings
    const safeZoneDTO: ZoneDTO = rawZone ? {
      zoneName: rawZone.zoneName ?? '',
      cityDTO: {
        cityName: rawZone.cityDTO?.cityName ?? '',
        provinceDTO: {
          provinceName: rawZone.cityDTO?.provinceDTO?.provinceName ?? '',
          countryDTO: {
            countryName: rawZone.cityDTO?.provinceDTO?.countryDTO?.countryName ?? ''
          }
        }
      }
    } : defaultZone;

    // 3. Construct the Filter Object
    // We strictly use '??' to ensure NO nulls are sent, only '' or 0.
    this.filterResult = {
      operationTypeDTO: {
        operationName: this.form.get('operationTypes')?.value ?? ''
      },
      propertyTypeDTO: {
        typeName: this.form.get('propertyTypes')?.value ?? ''
      },
      zoneDTO: safeZoneDTO,
      minPrice: this.form.get('minPrice')?.value ?? 0,
      maxPrice: this.form.get('maxPrice')?.value ?? 0,
      rooms: this.form.get('rooms')?.value ?? 0,
      amenityDTOList: selectedAmenitiesDTO
    } as PropertiesFilter;

    // 4. UI State Updates
    this.resetPageInfo();
    this.isFilter = true;

    console.log("Filter payload to send:", this.filterResult);

    // 5. API Call
    this.propertyService.applyFilter(this.filterResult, this.pageSelected).subscribe({
      next: (data) => {
        // CASE: Results found
        if (data.content && data.content.length > 0) {
          this.updatePageInfo(data.totalPages - 1, data.number, data.content);
          this.properties.forEach((value) => this.choiceMainImage(value));

          this.filterFailed = false; // Important: Ensure error state is cleared
          console.log("Properties loaded successfully from filter");
        }
        // CASE: No results found (FIX ADDED HERE)
        else {
          console.log("Filter returned no results.");
          this.properties = []; // Clear the list
          this.filterFailed = true; // Trigger the "No properties found" UI
          this.numberOfPropertiesLoadInArray = 0;
        }
      },
      error: (e) => {
        console.error("Error applying filter:", e);
        // Optional: Handle visual error feedback here
        this.filterFailed = true;
      }
    });
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
      rooms: 0
    });

    this.numberRoomsSelect = 0; // Reset visual selection

    const amenitiesControl = this.getAmenitiesFormArray();
    if (amenitiesControl) {
      amenitiesControl.controls.forEach(control => control.setValue(false));
    }

    this.resetPageInfo();
    this.loadProperties();
  }

  // ==========================================
  // CHILD COMPONENT INTERACTION (ADMIN)
  // ==========================================

  updateAmenities(): void {
    console.log("Guardando configuración de amenities...");

    // Security check: if the child is not rendered (adminMode=false), we do nothing
    if (!this.childComponent) {
      console.error("El componente de configuración no está activo.");
      return;
    }

    const featuredToUpdate = this.childComponent.featured;

    this.amenityService.updateFeatures(featuredToUpdate).subscribe({
      next: (data) => {
        console.log("Update exitoso", data);
        this.adminMode = false; // We close the admin mode
        this.loadAmenities(); // Refresh to see the changes
      },
      error: (e) => console.log(e)
    });
  }
}