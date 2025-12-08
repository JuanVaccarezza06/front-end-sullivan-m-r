import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import GeneralInquiry from '../../models/contact/GeneralInquiry';
import { Router } from '@angular/router';
import { ContactService } from '../../services/contactService/contact-service';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {

  formulario!: FormGroup
  generalInquiry!: GeneralInquiry

  motives!: string[]

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) { }

  ngOnInit(): void {

    //this.motives = this.contactService.getMotives()

    this.formulario = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^\S+\s+\S+.*$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      numberPhone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]+$/), Validators.maxLength(20), Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      motive: ['', [Validators.required]],
      state: ['PENDIENTE', [Validators.required]]
    });

  }

  onSubmit(): void {

    const fullName = this.formulario.value.name;

    const lastSpace = fullName.lastIndexOf(' ');
    const name = lastSpace !== -1 ? fullName.slice(0, lastSpace) : fullName;
    const surname = lastSpace !== -1 ? fullName.slice(lastSpace + 1) : '';

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // "2025-10-27"

    this.generalInquiry = {
      date: formattedDate, // o new Date()
      description: this.formulario.value.description,
      stateDTO: this.formulario.value.state,
      userDTO: {
        firstName: name, // suponiendo que "name" es el nombre del usuario
        surname: surname, // completar si tenés el campo
        email: this.formulario.value.email,
        numberPhone: this.formulario.value.numberPhone.trim()
      },
      motiveDTO: {
        motiveName: this.formulario.value.motive
      }
    };

    this.contactService.post(this.generalInquiry).subscribe({
      next: (data) => console.log(data),
      error: (e) => console.log(e)
    })
  }
}
