import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import CredentialRegister from '../../models/CredentialRegister';
import CredentialLogIn from '../../models/CredentialLogIn';
import { LogInService } from '../../services/log-in-service';
import { RegisterService } from '../../services/register-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-autentication-form',
  imports: [ReactiveFormsModule],
  templateUrl: './autentication-form.html',
  styleUrl: './autentication-form.css'
})
export class AutenticationForm {

  formulario!: FormGroup
  credentialLogIn!: CredentialLogIn
  credentialRegister!: CredentialRegister
  isRegister!: boolean

  thereIsError!: boolean

  constructor(
    private fb: FormBuilder,

    private serviceLogIn: LogInService,
    private serviceRegister: RegisterService,

    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {

    if (this.router.url.includes('register')) this.isRegister = true

    if (!this.isRegister) {
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
    } else if (this.isRegister) {
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
        secondName: ['', [
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


  }

  onSumbit() {
    if (this.isRegister) {
      this.credentialRegister = this.formulario.value

      this.serviceRegister.post(this.credentialRegister).subscribe({
        next: (data) => console.log(data),
        error: (e) => console.log(e)
      })
    } else {
      this.credentialLogIn = this.formulario.value

      this.serviceLogIn.post(this.credentialLogIn).subscribe({
        next: (data) => console.log(data),
        error: (e) => console.log(e)
      })
    }
  }
}
