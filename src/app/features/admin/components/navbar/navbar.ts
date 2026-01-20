import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  
  menuAbierto: string = '';

  // Función para abrir/cerrar
  toggleSubmenu(nombreMenu: string) {
    if (this.menuAbierto === nombreMenu) {
      this.menuAbierto = ''; // Si ya estaba abierto, lo cierro
    } else {
      this.menuAbierto = nombreMenu; // Si no, lo abro
    }
  }
}
