import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LogInService } from '../../services/log-in-service';
import CredentialLogIn from '../../models/CredentialLogIn';

@Component({
  selector: 'app-log-in',
  imports: [ReactiveFormsModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css'
})
export class LogIn{

  formulario!: FormGroup
  credential! : CredentialLogIn

  constructor(
    private fb: FormBuilder,
    private service : LogInService
  ) { }

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
    this.credential = this.formulario.value
    
    
    this.service.post(this.credential).subscribe({
      next: (data) => console.log(data),
      error: (e) => console.log(e)
    })

  }





}
