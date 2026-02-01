import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Property from '../../../../core/models/properties/Property';
import { ImgBbService } from '../../../../core/services/imgbb-service/img-bb-service';
import { PropertyService } from '../../../../core/services/property-service/property-service';
import { P } from '@angular/cdk/keycodes';

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
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties() {
    this.propertyService.getAll(this.pageSelected).subscribe({
      next: (data) => {
        this.properties = data._embedded ? data._embedded['propertyDTOList'] : [];
        if(!this.properties) console.error("Properties array empty.")
        this.numberOfPropertiesLoadInArray = this.properties.length;
        this.properties = this.propertyService.processPropertyImages(this.properties)
      },
      error: (e) => console.log(e),
    });
  }

  goToEdit(propertyToEdit: Property) {
    return this.router.navigate(['admin/properties/edit',propertyToEdit.id], {
      state: { info: propertyToEdit },
    });
  }

  goToDetail(propertyToSee: Property) {
    return this.router.navigate(['properties',propertyToSee.id], {
      state: { info: propertyToSee },
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
