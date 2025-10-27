import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import CredentialLogIn from '../../models/CredentialLogIn';
import { AuthService } from '../../services/auth/auth-service';
import { Router } from '@angular/router';

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
    private service : AuthService,
    private router : Router
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
    
    this.service.logIn(this.credential).subscribe({
      next: (data) => {
        localStorage.setItem('token', btoa(JSON.stringify(data)))
        console.log("Token almacenado con exito.")
        this.router.navigate([''])
      },
      error: (e) => console.log(e)
    })

  }

  irAdmin(){
    return this.router.navigate(['/admin'])
  }





}
