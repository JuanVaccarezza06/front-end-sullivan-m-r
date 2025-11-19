import { Component, OnInit } from '@angular/core';
import { PropertyService } from '../../../services/propertyServices/property/property-service';
import Property from '../../../models/property/Property';
import { ImgBbService } from '../../../services/propertyServices/imgBB/img-bb-service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-property-list',
  imports: [],
  templateUrl: './property-list.html',
  styleUrl: './property-list.css'
})
export class PropertyList implements OnInit {

  lastPage!: number
  pageSelected!: number
  properties!: Property[]
  numberOfPropertiesLoadInArray!: number

  imageNotFound!: string

  constructor(
    private propertyService: PropertyService,
    private imgbbService: ImgBbService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProperties()
    this.imageNotFound = this.imgbbService.getNotFound()
  }

  loadProperties() {
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

  goToEdit(propertyToEdit: Property) {
    return this.router.navigate(['admin/form-update'], {
      state: { info: propertyToEdit }
    });
  }

  goToDetail(propertyToSee: Property) {

    return this.router.navigate(['property-detail'], {
      state: { propertyData: propertyToSee }
    });
  }

  goToDelete(propertyToSee: Property) {
    const confirmation = confirm('¿Estás seguro de que quieres eliminar este elemento?');

    if (confirmation) {
      this.propertyService.delete(propertyToSee).subscribe({
        next: (data) => {
          console.log(data)
          this.loadProperties();
        },
        error: (e) => console.log(e)
      })
    } else alert("Safaste")
  }

  goToPost() {
    return this.router.navigate(['admin/form-post'])
  }

  changePage(signal: boolean) {
    if (signal && this.pageSelected < this.lastPage) {
      this.pageSelected++
      this.loadProperties()
    } else if (!signal && this.pageSelected > 0) {
      this.pageSelected--
      this.loadProperties()
    }
  }
}
