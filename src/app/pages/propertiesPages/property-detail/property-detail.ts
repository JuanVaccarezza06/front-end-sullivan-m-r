import { Component, OnInit } from '@angular/core';
import Property from '../../../models/property/Property';
import { PropertyService } from '../../../services/propertyServices/property/property-service';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-property-detail',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css'
})
export class PropertyDetail implements OnInit {

  form!: FormGroup

  lastPage!: number
  pageSelected!: number
  properties: Property[] = []
  propertySelected!: Property
  numberOfPropertiesLoadInArray!: number

  imageNotFound!: string

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {

    this.formInitializer()

    const state = this.router.lastSuccessfulNavigation?.extras?.state as { propertyData: Property };
    if (!state) {
      console.error("La property es nula.")
      this.router.navigate(['properties'])
    } else if (state) {
      this.propertySelected = state.propertyData;
      this.choiceMainImage(this.propertySelected)
    }

  }

  formInitializer() {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^\S+\s+\S+.*$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      numberPhone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]+$/), Validators.maxLength(20), Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      state: ['PENDIENTE', [Validators.required]],
      conditions: ['', [Validators.required]]
    });
  }

  onSumbit() {
    const fullName = this.form.get('fullName')?.value;

    const lastSpace = fullName.lastIndexOf(' ');
    const name = lastSpace !== -1 ? fullName.slice(0, lastSpace) : fullName;
    const surname = lastSpace !== -1 ? fullName.slice(lastSpace + 1) : '';

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // "2025-10-27"

    let result = {
      date: formattedDate, // o new Date()
      description: this.form.value.description,
      stateDTO: this.form.value.state,
      firstName: name, // suponiendo que "name" es el nombre del usuario
      surname: surname, // completar si tenés el campo
      email: this.form.value.email,
      numberPhone: this.form.value.numberPhone.trim()
      
    };

    console.log(result)
  }

  choiceMainImage(p: Property) {
    if (!p.imageDTOList || p.imageDTOList.length == 0) p.mainImage = this.imageNotFound; // If the image array is null or empty, we load the not found image in the cards
    else if (!p.imageDTOList.find(img => img.name.includes("Portada"))) p.mainImage = p.imageDTOList[0].url // If the image array don't has any image with 'portada' name, load any image
    else p.mainImage = p.imageDTOList.find(img => img.name.includes("Portada"))?.url // If the image array has the 'portada' image, it returs
  }

}
