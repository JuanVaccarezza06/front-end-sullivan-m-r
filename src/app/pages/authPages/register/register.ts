import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/authService/auth-service';
import CredentialRegister from '../../../models/auth/CredentialRegister';
import UserFull from '../../../models/actors/UserFull';
import { UserService } from '../../../services/userService/user-service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  formulario!: FormGroup
  credential!: CredentialRegister

  constructor(
    private fb: FormBuilder,
    private service: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.formulario = this.fb.group({

      username: ['', [Validators.minLength(6), Validators.maxLength(30), Validators.required]],
      password: ['', [Validators.minLength(8), Validators.maxLength(30), Validators.required,
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~]).+$/),
      ]],
      firstName: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
      surname: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254), Validators.minLength(6)]],
      numberPhone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]+$/), Validators.maxLength(20), Validators.minLength(3)]]
    })


  }

  onSumbit() {

    this.credential = this.formulario.value

    this.service.register(this.credential).subscribe({
      next: (data) => {
        const token = data.token
        if (token) {
          this.service.saveToken(token)
          console.log("Token almacenado con exito.")

          this.router.navigate([''], {
            state: { message: 'Usuario registrado correctamente.' }
          });
        }
      },
      error: (e) => console.log(e)
    })
  }

}



