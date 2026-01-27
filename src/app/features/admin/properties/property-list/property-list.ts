import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Property from '../../../../core/models/properties/Property';
import { ImgBbService } from '../../../../core/services/imgbb-service/img-bb-service';
import { PropertyService } from '../../../../core/services/property-service/property-service';

@Component({
  selector: 'app-property-list',
  imports: [],
  templateUrl: './property-list.html',
  styleUrl: './property-list.css',
})
export class PropertyList implements OnInit {
  lastPage!: number;
  pageSelected!: number;
  properties!: Property[];
  numberOfPropertiesLoadInArray!: number;

  imageNotFound!: string;

  constructor(
    private propertyService: PropertyService,
    private imgbbService: ImgBbService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProperties();
    this.imageNotFound = this.imgbbService.getNotFound();
  }

  loadProperties() {
    this.propertyService.getAll(this.pageSelected).subscribe({
      next: (data) => {
        this.numberOfPropertiesLoadInArray = this.properties.length;
        this.properties.forEach((value) => this.choiceMainImage(value));
      },
      error: (e) => console.log(e),
    });
  }

  choiceMainImage(p: Property): string {
    const images = p.imageDTOList;

    // 1. Caso: No hay imágenes
    if (!images || images.length === 0) {
      return this.imageNotFound;
    }

    // 2. Caso: Buscar la imagen marcada como primaria (isPrimary: true)
    const primaryImg = images.find((img) => img.isPrimary);
    if (primaryImg) {
      return primaryImg.url;
    }

    // 3. Caso: No hay ninguna marcada como primaria, usamos la primera (fallback)
    return images[0].url;
  }

  goToEdit(propertyToEdit: Property) {
    return this.router.navigate(['admin/form-update'], {
      state: { info: propertyToEdit },
    });
  }

  goToDetail(propertyToSee: Property) {
    return this.router.navigate(['property-detail'], {
      state: { propertyData: propertyToSee },
    });
  }

  goToDelete(propertyToSee: Property) {
    const confirmation = confirm('¿Estás seguro de que quieres eliminar este elemento?');

    if (confirmation) {
      this.propertyService.delete(propertyToSee).subscribe({
        next: (data) => {
          console.log(data);
          this.loadProperties();
        },
        error: (e) => console.log(e),
      });
    } else alert('Safaste');
  }

  goToPost() {
    return this.router.navigate(['admin/form-post']);
  }

  changePage(signal: boolean) {
    if (signal && this.pageSelected < this.lastPage) {
      this.pageSelected++;
      this.loadProperties();
    } else if (!signal && this.pageSelected > 0) {
      this.pageSelected--;
      this.loadProperties();
    }
  }
}
