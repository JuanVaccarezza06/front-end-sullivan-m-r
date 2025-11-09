import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import Property from '../../models/property/Property';
import { PropertyService } from '../../services/propertyServices/property/property-service';
import { ImgBbService } from '../../services/propertyServices/imgBB/img-bb-service';
import { Router, RouterLink } from '@angular/router';
import { FilterPropertiesPage } from '../../components/filter-properties-page/filter-properties-page';

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

  numberPage : number = 0;
  

  ngOnInit(): void {

    const state = this.router.lastSuccessfulNavigation?.extras?.state as { filterHomeArray?: Property[] };
    const propertiesArray = state?.filterHomeArray;

    this.loadFilterProperties(propertiesArray as Property[])

    this.imageNotFound = this.imgService.getNotFound() // Load the not found image

  }

  loadFilterProperties(propertiesArray: Property[]) {
    if (propertiesArray && propertiesArray.length > 0) {
      this.properties = propertiesArray;
      this.properties.forEach((value) => this.choiceMainImage(value))
      this.isFilter = true
      console.log("Properties load from filter.");
    }
    else {
      this.loadProperties()
      console.log("Properties load from database.");
      this.isFilter = false;
    }
  }

  loadProperties() {
    this.propertyService.getAll(this.numberPage).subscribe({
      next: (data : any) => {
        this.properties = data.content 
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
    this.resetFilters.emit();
  }

}


