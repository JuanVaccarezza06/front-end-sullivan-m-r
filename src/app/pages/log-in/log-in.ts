import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import CredentialLogIn from '../../models/security/CredentialLogIn';
import { AuthService } from '../../services/authService/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-in',
  imports: [ReactiveFormsModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css'
})
export class LogIn {

  formulario!: FormGroup
  credential!: CredentialLogIn

  constructor(
    private fb: FormBuilder,
    private service: AuthService,
    private router: Router,
    public authService: AuthService

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
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~]).+$/),
      ]
      ]
    })
  }

  onSumbit() {
    this.credential = this.formulario.value

    this.service.logIn(this.credential).subscribe({
      next: (data) => {
        const token = data.token
        if (token) {
          this.authService.saveToken(token)
          console.log("Token almacenado con exito.")
          
          this.router.navigate([''], {
            state: { message: 'Usuario logeado correctamente.' }
          });
        }

      },
      error: (e) => console.log(e)
    })
  }

  irAdmin() {
    return this.router.navigate(['/admin'])
  }

  autoLog() {
    this.formulario.patchValue({
      username: "Sonia123#",
      password: "#123Secreto"
    })
  }





}
