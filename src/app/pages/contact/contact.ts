import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import GeneralInquiry from '../../models/GeneralInquiry';
import { Router } from '@angular/router';
import { ContactService } from '../../services/auth/contact-service';
import { dateTimestampProvider } from 'rxjs/internal/scheduler/dateTimestampProvider';

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
    private router: Router,
    private contactService: ContactService
  ) { }

  ngOnInit(): void {

    //this.motives = this.contactService.getMotives()

    this.formulario = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      email: ['', [Validators.required, Validators.email]],
      numberPhone: ['', [Validators.required,   Validators.pattern('^[0-9 ]+$'), Validators.minLength(6), Validators.maxLength(20)] ], // solo números, entre 6 y 15 dígitos 
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      motive: ['', [Validators.required]],
      state: ['PENDIENTE']
    });

  }

  onSubmit(): void {

    const fullName = this.formulario.value.name.trim(); // por seguridad
    const [first_name, ...rest] = fullName.split(' ');
    const surname = rest.join(' '); // por si hay apellidos compuestos

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // "2025-10-27"

    this.generalInquiry = {
      date: formattedDate, // o new Date()
      description: this.formulario.value.description,
      state: this.formulario.value.state,
      userDTO: {
        firstName: first_name, // suponiendo que "name" es el nombre del usuario
        surname: surname, // completar si tenés el campo
        email: this.formulario.value.email,
        numberPhone: this.formulario.value.numberPhone.trim()
      },
      motiveDTO: {
        motiveName: this.formulario.value.motive
      }
    };

    this.contactService.post(this.generalInquiry as GeneralInquiry).subscribe({
      next: (data) => console.log(data),
      error: (e) => console.log(e)
    })
  }

}
