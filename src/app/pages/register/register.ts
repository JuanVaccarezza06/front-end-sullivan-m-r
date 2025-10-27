import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import CredentialRegister from '../../models/CredentialRegister';
import { AuthService } from '../../services/auth/auth-service';
import { Router } from '@angular/router';

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
      ],
      firstName: ['', [
        Validators.required,
        Validators.maxLength(20),
        Validators.minLength(3)
      ]
      ],
      surname: ['', [
        Validators.required,
        Validators.maxLength(20),
        Validators.minLength(3)
      ]
      ],
      email: ['', [
        Validators.required,
        Validators.email
      ]
      ],
      countryCode: ['', [
        Validators.required
      ]
      ],
      areaCode: ['', [
        Validators.required
      ]
      ],
      numberPhone: ['', [
        Validators.required
      ]
      ],
    })
  }

  onSumbit() {
    this.credential = this.formulario.value

    this.service.register(this.credential).subscribe({
      next: (data) => {
        localStorage.setItem('token', btoa(JSON.stringify(data)))
        console.log("Token almacenado con exito.")
        this.router.navigate([''])
      },
      error: (e) => console.log(e)
    })

  }

}


