import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service/auth-service';

@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule, RouterOutlet,RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  // Inyección del router para lógica de activado en SVGs
  router = inject(Router);
  private authService = inject(AuthService);
  
  // Estado para los acordeones del sidebar
  menuAbierto: string = '';

  toggleSubmenu(nombreMenu: string) {
    this.menuAbierto = (this.menuAbierto === nombreMenu) ? '' : nombreMenu;
  }

  logOut(){
    this.authService.logout()
    
  }
}