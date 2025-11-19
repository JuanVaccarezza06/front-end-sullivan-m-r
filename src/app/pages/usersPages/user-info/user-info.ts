import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { UserService } from '../../../services/userService/user-service';
import UserFull from '../../../models/actors/UserFull';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
  selector: 'app-user-detail',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './user-info.html',
  styleUrl: './user-info.css'
})
export class UserInfo implements OnInit {

  userSelected: UserFull = {
    firstName: "Elliot",
    surname: "Alderson",
    email: "mr.robot@fsociety.dat",
    numberPhone: "+1 212-555-0100",
    username: "bonsoir_elliot"
  }

  users: UserFull[] = []

  form!: FormGroup

  isFindBy: boolean = false
  userNotFound: boolean = false

  numberPagesInDatabase: number = 0
  numberOfPropertiesLoadInArray: number = 0
  pageSelected: number = 0
  lastPage: number = 0

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.formInitilizer()
    this.loadUsers()
  }

  formInitilizer() {
    this.form = this.fb.group({
      inputToFind: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    });
  }

  loadUsers() {
    this.userService.getAll(this.pageSelected).subscribe({
      next: (data) => {
        this.lastPage = data.totalPages - 1
        this.pageSelected = data.number
        this.users = data.content
        this.numberOfPropertiesLoadInArray = this.users.length

      },
      error: (e) => console.log(e)
    })
  }

  selectUser(user: UserFull) {
    this.userSelected = user;
  }

  changePage(signal: boolean) {
    if (signal && this.pageSelected < this.lastPage) {
      this.pageSelected++
      this.loadUsers()
    } else if (!signal && this.pageSelected > 0) {
      this.pageSelected--
      this.loadUsers()
    }
  }

  updateUser(user: UserFull) {
    return this.router.navigate(['admin/user-update'], {
      state: { userToUpdate: user }
    });
  }

  onSubmit() {
    let inputValue = this.form.get('inputToFind')?.value

    if (inputValue) {
      this.userService.getByEmail(inputValue).subscribe({
        next: (data) => {
          console.log("Get by email exitoso.")
          this.users = []
          this.users.push(data)
          this.isFindBy = true
        },
        error: (e) => {
          if (e.status == 404) {
            this.userNotFound = true
            console.log("User no encontrado")
            setTimeout(() => {
              this.userNotFound = false;
            }, 3000);

          }
        }
      })
    } else console.error("Input vacio")
    
  }

  cleanFilter() {
    this.isFindBy = false
    this.loadUsers()
  }

  deleteUser(user : UserFull){
    this.userService.delete(user).subscribe({
      next: (dat) => {
        console.log("Delete exitoso")
        this.loadUsers()
      },
      error: (e) => console.log(e)
    })
  } 


}
