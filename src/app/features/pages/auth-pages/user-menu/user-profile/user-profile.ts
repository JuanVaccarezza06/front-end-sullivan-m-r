import { Component, inject } from '@angular/core';
import { UserService } from '../../../../../core/services/user-service/user-service';
import UserFull from '../../../../../core/models/actors/UserFull';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth-service/auth-service';

@Component({
  selector: 'app-user-profile',
  imports: [],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile {
  // 1. INYECCIÓN DE DEPENDENCIAS
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // NOTA: Si getUserByUsername devuelve 'User', cambia el tipo aquí a 'User | null'
  // Si devuelve 'UserFull', déjalo como está.
  user!: UserFull;
  loading: boolean = true;

  memberSince: string = 'Enero 2024';

  menuItems = [
    { label: 'Informacion General', icon: 'pi pi-user', active: true },
    { label: 'Mis Favoritos', icon: 'pi pi-heart', active: false },
    { label: 'Mis Consultas', icon: 'pi pi-comments', active: false },
    { label: 'Notificaciones', icon: 'pi pi-bell', active: false },
    { label: 'Seguridad', icon: 'pi pi-shield', active: false },
  ];

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData() {
    // 1. Obtenemos el USERNAME del token (Ej: "Sonia123")
    const usernameFromToken = this.authService.getUsername();

    if (usernameFromToken) {
      this.loading = true;
      // 2. CORRECCIÓN: Usamos getUserByUsername en lugar de getByEmail
      this.userService.getUserFullByUsername(usernameFromToken).subscribe({
        next: (data) => {
          console.log('Usuario cargado:', data);
          this.user = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar perfil:', error);
          this.loading = false;

          // Si da 401 o 403, es probable que el token expiró o es inválido
          if (error.status === 401 || error.status === 403) {
            // Opcional: Desloguear si el token ya no sirve
            // this.authService.logout();
            // this.router.navigate(['/auth/log-in']);
          }
        },
      });
    } else {
      console.warn('No se encontró username en el token');
      this.router.navigate(['/auth/log-in']);
    }
  }

  userEdit() {
    return this.router.navigate(['/profile/edit'], {
      state: { userToUpdate: this.user },
    });
  }
}
