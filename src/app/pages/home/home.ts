import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { filter } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  mensajeExito: string = '';
  isLogged: boolean = false;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {

    const state = this.router.lastSuccessfulNavigation?.extras?.state as { message?: string };
    console.log(state.message)
    let message = state?.message || null;

    if (message) {
      this.isLogged = true;
      this.mensajeExito = message
      setTimeout(() => {
      this.isLogged = false;
    }, 4000);
    }
  }






}
