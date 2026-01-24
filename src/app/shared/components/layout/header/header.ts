import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth-service/auth-service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  // Inyección moderna (opcional, pero recomendada)
  private authService = inject(AuthService);
  private router = inject(Router);

  isMenuOpen: boolean = false;

  // Datos por defecto (vacíos para no mostrar info falsa antes de cargar)
  userName: string = '';
  userEmail: string = '';
  userInitials: string = '';

  ngOnInit(): void {
    // Intentamos cargar los datos apenas inicia el componente
    this.loadUserFromToken();
  }

  constructor() {
    // ESTA ES LA SOLUCIÓN:
    // Escuchamos cada vez que termina una navegación.
    // Si el usuario pasa del Login al Home, esto se dispara y recarga los datos.
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.loadUserFromToken();
    });
  }

  /**
   * Extrae los datos del token JWT almacenado
   */
  loadUserFromToken() {
    if (this.isLogged()) {
      const payload = this.authService.getTokenPayload();

      if (payload) {
        // 1. Obtener nombre/usuario.
        // Normalmente el 'sub' es el username/email.
        // Si tu backend manda un campo 'name' extra, usa: payload.name || payload.sub
        this.userName = payload.sub || 'Usuario';
        this.userEmail = payload.sub || '';

        // 2. Calcular iniciales
        this.userInitials = this.calculateInitials(this.userName);
      }
    }
  }

  calculateInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');

    if (parts.length === 1) {
      // Si es solo "Juan", devuelve "JU"
      return parts[0].substring(0, 2).toUpperCase();
    } else {
      // Si es "Juan Martinez", devuelve "JM"
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
  }

  isLogged() {
    return this.authService.isLoggedIn();
  }

  isAdmin() {
    return this.authService.hasRoleAdmin();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logOut() {
    this.closeMenu();
    this.authService.logout();

    // Limpiamos las variables visuales
    this.userName = '';
    this.userEmail = '';
    this.userInitials = '';

    this.router.navigate([''], { state: { message: 'Cierre de sesion exitoso' } });
  }
}
