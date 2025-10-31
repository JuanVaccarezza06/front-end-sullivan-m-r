import { Component, OnInit } from '@angular/core';
import { Router, } from "@angular/router";
import Property from '../../models/property/Property';
import { PropertyService } from '../../services/propertyServices/property/property-service';
import { ImgBbService } from '../../services/propertyServices/imgBB/img-bb-service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  mensajeExito: string = '';
  isLogged: boolean = false;

  propertiesfeature!: Property[]

  imageNotFound!: string

  constructor(
    private service: PropertyService,
    private imgService: ImgBbService,
    private router: Router
  ) { }

  ngOnInit(): void {

    const state = this.router.lastSuccessfulNavigation?.extras?.state as { message?: string };
    let message = state?.message || null;

    if (message) {
      this.isLogged = true;
      this.mensajeExito = message
      setTimeout(() => {
        this.isLogged = false;
      }, 2000);
    }

    this.service.getAll().subscribe({
      next: (data) => {
        this.propertiesfeature = data
        this.propertiesfeature.forEach((value) => this.choiceMainImage(value))

      },
      error: (e) => console.log(e)
    });

    this.imageNotFound = this.imgService.getNotFound()
    
    

  }

  choiceMainImage(p: Property) {
    if (!p.imageDTOList || p.imageDTOList.length == 0) p.mainImage = this.imageNotFound;
    else if (!p.imageDTOList.find(img => img.name.includes("Portada"))) p.mainImage = this.imageNotFound;
    else p.mainImage = p.imageDTOList.find(img => img.name.includes("Portada"))?.url
  }

}
