import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import UserFull from '../../../models/actors/UserFull';
import { Router } from '@angular/router';
import { UserService } from '../../../services/userService/user-service';
import { UserInfo } from '../user-info/user-info';

@Component({
  selector: 'app-user-update',
  imports: [ReactiveFormsModule],
  templateUrl: './user-update.html',
  styleUrl: './user-update.css'
})
export class UserUpdate implements OnInit {

  formulario!: FormGroup
  user!: UserFull

  constructor(
    private fb: FormBuilder,
    private service: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {

    const state = this.router.lastSuccessfulNavigation?.extras?.state as { userToUpdate?: UserFull };
    if(state.userToUpdate) this.user = state?.userToUpdate
    else console.error("User para actualizar nulo")

    this.formulario = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(3)]],
      surname: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254), Validators.minLength(6)]],
      numberPhone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]+$/), Validators.maxLength(20), Validators.minLength(3)]]
    })

    this.formulario.patchValue(this.user)
  }

  onSumbit() {

    let userForm = this.formulario.value

    this.service.update(userForm,this.user.email).subscribe({
      next: (data) => {
        console.log("Update done")
        console.log(data)
        this.router.navigate(['admin/user-info'])
      },
      error: (e) => console.log(e)
    })
  }

}
