import { Component, OnInit } from '@angular/core';
import Property from '../../models/property/Property';
import { PropertyService } from '../../services/propertyServices/property/property-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-property-detail',
  imports: [RouterLink],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css'
})
export class PropertyDetail implements OnInit {

  lastPage!: number
  pageSelected!: number
  properties: Property[] = []
  propertySelected!: Property
  numberOfPropertiesLoadInArray!: number

  imageNotFound!: string

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {

    const state = this.router.lastSuccessfulNavigation?.extras?.state as { propertyData: Property };
    console.log(state.propertyData)
    if (!state) {
      console.error("La property es nula.")
      this.router.navigate(['properties'])
    } else if (state) {
      this.propertySelected = state.propertyData;
      this.choiceMainImage(this.propertySelected)
    }

  }

  choiceMainImage(p: Property) {
    if (!p.imageDTOList || p.imageDTOList.length == 0) p.mainImage = this.imageNotFound; // If the image array is null or empty, we load the not found image in the cards
    else if (!p.imageDTOList.find(img => img.name.includes("Portada"))) p.mainImage = p.imageDTOList[0].url // If the image array don't has any image with 'portada' name, load any image
    else p.mainImage = p.imageDTOList.find(img => img.name.includes("Portada"))?.url // If the image array has the 'portada' image, it returs
  }

}
