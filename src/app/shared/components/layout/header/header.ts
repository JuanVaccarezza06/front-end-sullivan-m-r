import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth-service/auth-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  
  // Controla si el menú está visible o no
  isMenuOpen: boolean = false;

  // Datos del usuario (mock)
  userName: string = 'Juan Martinez';
  userEmail: string = 'juan.martinez@email.com';
  userInitials: string = 'JM';

  constructor(
    public router: Router,
    private authService: AuthService,
  ) {}

  isLogged() {
    return this.authService.isLoggedIn();
  }

  isAdmin() {
    return this.authService.hasRoleAdmin();
  }

  // Abre o cierra el menú
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Cierra el menú explícitamente (útil al navegar)
  closeMenu() {
    this.isMenuOpen = false;
  }

  logOut() {
    this.closeMenu(); // Cerramos el menú
    this.authService.logout();
    this.router.navigate([''], { state: { message: 'Cierre de sesion exitoso' } });
  }
}
