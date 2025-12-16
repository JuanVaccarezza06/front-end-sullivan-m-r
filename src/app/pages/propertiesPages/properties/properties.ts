import { Component, EventEmitter, Input, NgZone, OnInit } from '@angular/core';
import Property from '../../../models/property/Property';
import { PropertyService } from '../../../services/propertyServices/property/property-service';
import { ImgBbService } from '../../../services/propertyServices/imgBB/img-bb-service';
import { Router } from '@angular/router';
import Amenity from '../../../models/property/complements/Amenity';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import ZoneDTO from '../../../models/property/geography/Zone';
import PropertyType from '../../../models/property/types/PropertyType';
import OperationType from '../../../models/property/types/OperationType';
import PropertiesFilter from '../../../models/property/request-response/PropertiesFilter';
import { PageResponse } from '../../../models/pagable/PageResponse';
import { AmenityService } from '../../../services/propertyServices/amenity/amenity-service';

@Component({
  selector: 'app-properties',
  imports: [ReactiveFormsModule],
  templateUrl: './properties.html',
  styleUrl: './properties.css'
})
export class Properties implements OnInit {

  form!: FormGroup

  // Objects that I need to show
  operationTypesArray!: OperationType[]
  propertyTypesArray: PropertyType[] = []
  zoneArray: ZoneDTO[] = []
  amenitiesArray!: Amenity[];
  amenitiesArrayFeatured!: Amenity[];
  properties!: Property[]
  filterResult!: PropertiesFilter
  amenityFound!: Amenity

  // With those variables i can take control about the number rooms!
  numberRooms: number[] = [1, 2, 3, 4, 5]
  numberRoomsSelect!: number

  // Variables for check if it is an edit page and if it is a filter
  isConfig: boolean = false
  isFilter: boolean = false

  // This variable helps me to take control if the filter was empty
  isFilterFailed: boolean = false

  // This variable helps me to take control if the user did a amenity search and if it failed
  isAmenitySearch: boolean = false
  isAmenityNotCoincidence: boolean = false

  isZoneConfig: boolean = false

  // Image not found for the properties main images not found
  imageNotFound!: string

  // All those variables are take control about the pages
  numberPagesInDatabase: number = 0
  numberOfPropertiesLoadInArray: number = 0
  pageSelected: number = 0
  lastPage: number = 0

  featured: Amenity[] = []


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

    const state = this.router.lastSuccessfulNavigation?.extras?.state as { homeResponse?: PageResponse<Property> | boolean };
    const homeResponseIntoConst = state?.homeResponse;

    if (homeResponseIntoConst === undefined) this.loadProperties();
    else if (homeResponseIntoConst === false) {
      this.isFilterFailed = true;
      this.isFilter = true;
    }
    else {
      const response = homeResponseIntoConst as PageResponse<Property>
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
      controlToSearchAmenity: ['', [Validators.required]]
    });
  }

  loadPropertiesFromHome(propertiesArray: Property[]) {
    this.properties = propertiesArray;
    this.properties.forEach((value) => this.choiceMainImage(value))

    this.isFilter = true

    this.numberOfPropertiesLoadInArray = this.properties.length

    console.log("Properties load from filter.");
  }

  loadProperties() {

    console.log("Properties load from database.");
    this.isFilter = false;

    this.propertyService.getAll(this.pageSelected).subscribe({
      next: (data) => {
        this.lastPage = data.totalPages - 1
        this.pageSelected = data.number
        this.properties = data.content
        this.numberOfPropertiesLoadInArray = this.properties.length
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

        this.amenitiesArrayFeatured = this.amenitiesArray.filter(value => value.isFeatured)

        const amenityControls = this.amenitiesArrayFeatured.map(() => this.fb.control(false));

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

  clearFilter() {
    this.isFilter = false
    this.isFilterFailed = false

    this.form.reset({
      operationTypes: '',
      propertyTypes: '',
      zone: '',
      minPrice: 0,
      maxPrice: 0,
      rooms: 0,
      amenities: this.amenitiesArrayFeatured.map(() => false)
    });
    this.resetPageInfo()

    this.loadProperties()
  }

  resetPageInfo() {
    this.numberPagesInDatabase = 0;
    this.numberOfPropertiesLoadInArray = 0;
    this.pageSelected = 0;
    this.lastPage = 0;
  }

  changePage(signal: boolean) {
    if (this.isFilter) {
      if (signal && this.pageSelected < this.lastPage) {
        this.pageSelected++
        this.propertyService.applyFilter(this.filterResult, this.pageSelected).subscribe({
          next: (data) => {
            this.lastPage = data.totalPages - 1
            this.pageSelected = data.number
            this.properties = data.content
            this.numberOfPropertiesLoadInArray = this.properties.length
            this.properties.forEach((value) => this.choiceMainImage(value))
            console.log("Properties load from chagePage")
          },
        })
      } else if (!signal && this.pageSelected > 0) {
        this.pageSelected--
        this.propertyService.applyFilter(this.filterResult, this.pageSelected).subscribe({
          next: (data) => {
            this.lastPage = data.totalPages - 1
            this.pageSelected = data.number
            this.properties = data.content
            this.numberOfPropertiesLoadInArray = this.properties.length
            this.properties.forEach((value) => this.choiceMainImage(value))
            console.log("Properties load from chagePage")
          },
        })
      }
    } else {
      if (signal && this.pageSelected < this.lastPage) {
        this.pageSelected++
        this.loadProperties()
      } else if (!signal && this.pageSelected > 0) {
        this.pageSelected--
        this.loadProperties()
      }
    }

  }

  goToDetail(propertyToSee: Property) {
    return this.router.navigate(['property-detail'], {
      state: { propertyData: propertyToSee }
    });
  }

  setRoomsValue(value: number) {
    this.form.get('rooms')?.setValue(value);
    this.numberRoomsSelect = value
  }

  findAmenityByName() {

    this.isAmenitySearch = true

    console.log("Principio del find by...")
    console.log("1ero es 'isSearch' y el 2do es 'isAmenityNotCoincidence'")
    console.log(this.isAmenitySearch)
    console.log(this.isAmenityNotCoincidence)

    console.log("Este es isConfig")
    console.log(this.isConfig)

    console.log("1ero es 'isFilter' y el 2do es 'isFilterFailed'")
    console.log(this.isFilter)
    console.log(this.isFilterFailed)

    console.log("Valor de controlToSearchAmenity")
    console.log(this.form.get('controlToSearchAmenity')?.value)
    const amenityName = this.form.get('controlToSearchAmenity')?.value
    this.amenityService.getAmenityByName(amenityName).subscribe({
      next: (data) => {
        this.amenityFound = data
        this.isAmenitySearch = true

        console.log("\n\nEstamos en el next.")
        console.log("1ero es 'isSearch' y el 2do es 'isAmenityNotCoincidence'")
        console.log(this.isAmenitySearch)
        console.log(this.isAmenityNotCoincidence)

        console.log("Este es isConfig")
        console.log(this.isConfig)

        console.log("1ero es 'isFilter' y el 2do es 'isFilterFailed'")
        console.log(this.isFilter)
        console.log(this.isFilterFailed)

        console.log("Valor del data!!!")
        console.log(data)
      },
      error: (e) => {
        this.isAmenityNotCoincidence = true;

        console.log("\n\nEstamos en el error (antes del clear search!.")
        console.log("1ero es 'isSearch' y el 2do es 'isAmenityNotCoincidence'")
        console.log(this.isAmenitySearch)
        console.log(this.isAmenityNotCoincidence)

        console.log("Este es isConfig")
        console.log(this.isConfig)

        console.log("1ero es 'isFilter' y el 2do es 'isFilterFailed'")
        console.log(this.isFilter)
        console.log(this.isFilterFailed)

        console.log("Valor del error!!!")
        console.log(e)
        setTimeout(() => {
          this.clearSearch()
        }, 3000);

        console.log("\n\nEstamos en el error (despues del clear search!.")
        console.log("Principio del find by...")
        console.log("1ero es 'isSearch' y el 2do es 'isAmenityNotCoincidence'")
        console.log(this.isAmenitySearch)
        console.log(this.isAmenityNotCoincidence)

        console.log("Este es isConfig")
        console.log(this.isConfig)

        console.log("1ero es 'isFilter' y el 2do es 'isFilterFailed'")
        console.log(this.isFilter)
        console.log(this.isFilterFailed)

        console.log("Valor del error!!!")
        console.log(e)
      }
    })
  }

  clearSearch() {
    this.form.setControl('controlToSearchAmenity', new FormControl('', Validators.required));
    this.isAmenityNotCoincidence = false;
    this.isAmenitySearch = false
    this.router.navigate(["properties"])
  }

  onSumbit() {

    console.log("Inputs (checkboxes)")
    console.log(this.form.get('amenities')?.value)

    console.log("Amenities array featured")
    console.log(this.amenitiesArrayFeatured)

    // It get a boolean array, order by the original values from the amenitiesArray
    const selectedBooleans: boolean[] = this.form.get('amenities')?.value;
    // It transform or parse the booleans to amenity real info. So easy but complex
    let selectedAmenitiesDTO: Amenity[] = this.amenitiesArrayFeatured
      .filter((amenity, index) => selectedBooleans[index]);

    selectedAmenitiesDTO ??= [];

    console.log("Selected amenities")
    console.log(selectedAmenitiesDTO)

    let zoneValue = this.form.get('zone')?.value as ZoneDTO;

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

      zoneValue.zoneName = zoneValue.zoneName ?? '';

      zoneValue.cityDTO = zoneValue.cityDTO ?? { cityName: '', provinceDTO: {} };
      zoneValue.cityDTO.cityName = zoneValue.cityDTO.cityName ?? '';

      zoneValue.cityDTO.provinceDTO = zoneValue.cityDTO.provinceDTO ?? { provinceName: '', countryDTO: {} };
      zoneValue.cityDTO.provinceDTO.provinceName = zoneValue.cityDTO.provinceDTO.provinceName ?? '';

      zoneValue.cityDTO.provinceDTO.countryDTO = zoneValue.cityDTO.provinceDTO.countryDTO ?? { countryName: '' };
      zoneValue.cityDTO.provinceDTO.countryDTO.countryName = zoneValue.cityDTO.provinceDTO.countryDTO.countryName ?? '';
    }

    zoneValue.cityDTO.cityName ||= '';
    zoneValue.cityDTO.provinceDTO.provinceName ||= '';
    zoneValue.cityDTO.provinceDTO.countryDTO.countryName ||= '';

    this.filterResult = {
      operationTypeDTO: { "operationName": this.form.get('operationTypes')?.value },
      propertyTypeDTO: { "typeName": this.form.get('propertyTypes')?.value },
      zoneDTO: zoneValue,
      minPrice: this.form.get('minPrice')?.value,
      maxPrice: this.form.get('maxPrice')?.value,
      rooms: this.form.get('rooms')?.value,
      amenityDTOList: selectedAmenitiesDTO
    } as PropertiesFilter;

    this.resetPageInfo()
    this.isFilter = true;

    console.log(this.filterResult)

    this.propertyService.applyFilter(this.filterResult, this.pageSelected).subscribe({
      next: (data) => {

        if (data.content?.length > 0 && data.first) {
          this.lastPage = data.totalPages - 1
          this.pageSelected = data.number
          this.properties = data.content
          this.numberOfPropertiesLoadInArray = this.properties.length
          this.properties.forEach((value) => this.choiceMainImage(value))
          console.log("Properties load from onSumbit")
          console.log(data)
        } else {
          this.isFilterFailed = true;
          this.isFilter = true;
        }
      },
      error: (e) => console.log(e)
    });
  }

  deleteAmenity(amenity: Amenity) {
    if (!amenity) return
    this.amenityService.delete(amenity.amenityName).subscribe({
      next: (data) => {
        console.log("Se elimino correctamente.")
      }, error: (e) => {
        if (e.error == "DataIntegrityViolationException (SQL Exception): The record is associated with other record or the PK is duplicated") console.log(e.error)
      }
    })
  }

  addIntoFeaturedArray(item: Amenity, event: Event): void {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    item.isFeatured = isChecked;

    const index = this.featured.findIndex(
      (existingItem) => existingItem.amenityName === item.amenityName
    );

    if (index !== -1) {
      if (this.featured[index].isFeatured !== isChecked) {
        this.featured[index] = item;
      }
    } else this.featured.push(item);

  }

  updateAmenities(): void {
    this.amenityService.updateFeatures(this.featured).subscribe({
      next: (data) => {
        console.log("Salio todo bien")
        console.log(data)
        this.isConfig = false
        this.loadAmenities()
      },
      error: (e) => {
        console.log(e)
      }
    })
  }



}







