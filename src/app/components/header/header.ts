import { Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../services/authService/auth-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

  constructor(
    public router: Router,
    private authService: AuthService
  ) { }

  isLogged() {
    return this.authService.isLoggedIn();
  }

  isAdmin(){
    return this.authService.hasRoleAdmin()
  }


  logOut() {
    this.authService.logout();
    console.log("Token revocado con exito.")
    this.router.navigate([''], {
      state: { message: 'Cierre de sesion exitoso' }
    });

  }


}
