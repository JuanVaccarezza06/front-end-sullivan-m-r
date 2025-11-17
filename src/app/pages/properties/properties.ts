import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import Property from '../../models/property/Property';
import { PropertyService } from '../../services/propertyServices/property/property-service';
import { ImgBbService } from '../../services/propertyServices/imgBB/img-bb-service';
import { Router, RouterLink } from '@angular/router';
import { FilterPropertiesPage } from '../../components/filters-forms/filter-properties-page/filter-properties-page';

@Component({
  selector: 'app-properties',
  imports: [RouterLink, FilterPropertiesPage],
  templateUrl: './properties.html',
  styleUrl: './properties.css'
})
export class Properties implements OnInit {

  constructor(
    private propertyService: PropertyService,
    private imgService: ImgBbService,
    private router: Router

  ) { }

  isFilter: boolean = false
  imageNotFound!: string

  properties!: Property[]

  resetFilters = new EventEmitter<void>();

  numberPagesInDatabase: number = 0
  numberOfPropertiesLoadInArray: number = 0
  pageSelected: number = 0
  lastPage: number = 0


  ngOnInit(): void {

    const state = this.router.lastSuccessfulNavigation?.extras?.state as { filterHomeArray?: Property[] };
    const propertiesArray = state?.filterHomeArray;

    this.pageSelected = 0;
    this.lastPage = 0;

    this.loadFilterProperties(propertiesArray as Property[])

    this.imageNotFound = this.imgService.getNotFound() // Load the not found image

    console.log(this.properties[0].id)

  }

  loadFilterProperties(propertiesArray: Property[]) {
    if (propertiesArray && propertiesArray.length > 0) {
      this.properties = propertiesArray;
      this.properties.forEach((value) => this.choiceMainImage(value))
      this.isFilter = true
      this.pageSelected = 0;
      this.lastPage = 0;
      this.numberOfPropertiesLoadInArray = this.properties.length
      console.log("Properties load from filter.");
    }
    else {
      this.loadProperties('Carge las propiedades desde el loadFilterProperties (ELSE)')
      console.log("Properties load from database.");
      this.isFilter = false;
    }
  }

  loadProperties(mensaje : string) {
    console.log(mensaje)
    this.propertyService.getAll(this.pageSelected).subscribe({
      next: (data) => {
        this.lastPage = data.totalPages-1
        this.pageSelected = data.number
        this.properties = data.content
        this.numberOfPropertiesLoadInArray = this.properties.length
        console.log(`Total properties per page ${this.numberOfPropertiesLoadInArray}`)
        console.log(`Page end ${this.lastPage}`)
        console.log(`Page number  ${this.pageSelected}`)

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

  onResetClick() {
    this.isFilter = false
    this.loadProperties('Cargue las propiedades desde el Filtro del propeties component')
    this.resetFilters.emit();
  }

  changePage(signal: boolean) {
    if (signal && this.pageSelected < this.lastPage) {
      this.pageSelected++
      this.loadProperties('Carge las propiedades desde el back page')
    } else if (!signal && this.pageSelected > 0) {
      this.pageSelected--
      this.loadProperties('Carge las propiedades desde el next page')
    }

  }
}

