import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { UserService } from '../../../../core/services/user-service/user-service';
import User from '../../../../core/models/actors/User';
import UserFull from '../../../../core/models/actors/UserFull';
import { toSignal } from '@angular/core/rxjs-interop';
import { StatusCard } from '../../ui/status-card/status-card';
import { AuthService } from '../../../../core/services/auth-service/auth-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, StatusCard],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  // Inyectamos el servicio de usuario (asegúrate de que esté importado correctamente)
  private userService = inject(UserService); 
  private readonly queryParams = toSignal(this.route.queryParamMap, { initialValue: null });
  private statusCleanupTimer: ReturnType<typeof setTimeout> | null = null;

  readonly statusMessage = signal('');
  readonly statusType = signal<'success' | 'error'>('success');
  readonly hasStatusMessage = computed(() => this.statusMessage().trim().length > 0);

  isMenuOpen: boolean = false;

  // Variables visuales inmediatas (del token)
  userName: string = '';
  userEmail: string = '';
  userInitials: string = '';

  // NUEVA VARIABLE: Aquí guardaremos el usuario completo traído del backend
  private currentUser: UserFull | null = null; 

  readonly routeStatus = computed(() => {
    const params = this.queryParams();
    const message = params?.get('msg')?.trim();
    const type = params?.get('type') as 'success' | 'error' | null;

    if (!message || (type !== 'success' && type !== 'error')) {
      return null;
    }

    return { message, type };
  });

  private readonly statusEffect = effect(() => {
    const status = this.routeStatus();

    if (!status) {
      this.clearStatusMessage();
      return;
    }

    this.statusMessage.set(status.message);
    this.statusType.set(status.type);
    this.scheduleStatusCleanup();
  });

  ngOnInit(): void {
    this.loadUserFromToken();
  }

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.loadUserFromToken();
    });
  }

  loadUserFromToken() {
    if (this.isLogged()) {
      const payload = this.authService.getTokenPayload();

      if (payload) {
        // 1. Datos visuales rápidos desde el token (para que no se vea vacío)
        this.userName = payload.sub || 'Usuario';
        this.userEmail = payload.sub || ''; // O el campo que uses para email
        this.userInitials = this.calculateInitials(this.userName);

        // Solo los administradores consultan el perfil completo.
        // Los usuarios comunes no deben disparar una llamada que el backend pueda bloquear.
        if (this.isAdmin()) {
          this.userService.getUserFullByUsername(this.userName).subscribe({
            next: (user: UserFull) => {
              this.currentUser = user;

              if (user.email) this.userEmail = user.email;
            },
            error: (err) => {
              console.error('Error al cargar datos completos del usuario', err);
            },
          });
        } else {
          this.currentUser = null;
        }
      }
    }
  }

  // --- NUEVOS MÉTODOS DE NAVEGACIÓN ---
  // Estos métodos reemplazan el routerLink directo para poder pasar el estado

  goToEditCredentials() {
    this.closeMenu();
    this.router.navigate(['/profile/edit']);
  }

  goToProfile() {
    this.closeMenu();
    this.router.navigate(['/profile']);
  }

  calculateInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    } else {
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
    this.userName = '';
    this.userEmail = '';
    this.userInitials = '';
    this.currentUser = null; // Limpiamos el usuario guardado
    this.router.navigate([''], {
      queryParams: { msg: 'Cierre de sesion exitoso', type: 'success' },
    });
  }

  private scheduleStatusCleanup(): void {
    if (this.statusCleanupTimer) {
      clearTimeout(this.statusCleanupTimer);
    }

    this.statusCleanupTimer = setTimeout(() => {
      this.clearStatusMessage();
      void this.router.navigate([], {
        queryParams: { msg: null, type: null },
        queryParamsHandling: 'merge',
      });
    }, 1000);
  }

  private clearStatusMessage(): void {
    if (this.statusCleanupTimer) {
      clearTimeout(this.statusCleanupTimer);
      this.statusCleanupTimer = null;
    }

    this.statusMessage.set('');
    this.statusType.set('success');
  }
}