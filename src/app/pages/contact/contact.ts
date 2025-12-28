import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import GeneralInquiry from '../../models/contact/GeneralInquiry';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactService } from '../../services/contactService/contact-service';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {

  formulario!: FormGroup

  inquiryToSend!: GeneralInquiry

  motives!: string[]

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private route: ActivatedRoute  // <--- Inyectar ActivatedRoute
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

    this.loadMotives()

    this.route.queryParams.subscribe(params => {
      const serviceTitle = params['subject'];

      if (serviceTitle) {
        this.prefillForm(serviceTitle);
      }
    });
  }

  loadMotives(){

  }

  private prefillForm(serviceTitle: string): void {
    let motiveValue = 'OTRO'; // Valor por defecto para el select

    // Mapeamos el Título del Servicio (del array) al Value del Select (del HTML)
    // Ajusta estos strings según tus títulos exactos en services.service.ts
    if (serviceTitle.includes('Venta')) motiveValue = 'VENTA';
    else if (serviceTitle.includes('Alquiler')) motiveValue = 'ALQUILER';
    else if (serviceTitle.includes('Tasación')) motiveValue = 'TASACION';
    else if (serviceTitle.includes('Administración')) motiveValue = 'OTRO'; // O agrega una opción ADMIN en tu select

    // Construimos el mensaje personalizado
    const customMessage = `Hola, me interesa el servicio de "${serviceTitle}". Me gustaría recibir más información y agendar una llamada.`;

    // Actualizamos el formulario (patchValue solo actualiza los campos que le pases)
    this.formulario.patchValue({
      motive: motiveValue,
      description: customMessage
    });
  }


  onSubmit(): void {

    const fullName = this.formulario.value.name;

    const lastSpace = fullName.lastIndexOf(' ');
    const name = lastSpace !== -1 ? fullName.slice(0, lastSpace) : fullName;
    const surname = lastSpace !== -1 ? fullName.slice(lastSpace + 1) : '';

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // "2025-10-27"

    this.inquiryToSend = {
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

    this.contactService.post(this.inquiryToSend).subscribe({
      next: (data) => console.log(data),
      error: (e) => console.log(e)
    })
  }
}
