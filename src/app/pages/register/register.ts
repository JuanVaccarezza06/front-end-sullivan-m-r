import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterService } from '../../services/register-service';
import CredentialRegister from '../../models/CredentialRegister';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  formulario!: FormGroup
  credential! : CredentialRegister

  constructor(
    private fb: FormBuilder,
    private service : RegisterService
  ){}

  ngOnInit(): void {

    this.formulario = this.fb.group({
      username: ['', [
        Validators.minLength(6),
        Validators.maxLength(20),
        Validators.required
      ]
      ],
      password: ['', [
        Validators.minLength(6),
        Validators.maxLength(20),
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~])[A-Za-z\d!@#$%^&*()_\-+=<>?{}[\]~]+$/)
      ]
      ]
    })

  }

  onSumbit(){
    // this.credential = this.formulario.value
    
    
    // this.service.post(this.credential).subscribe({
    //   next: (data) => console.log(data),
    //   error: (e) => console.log(e)
    // })

  }





}
