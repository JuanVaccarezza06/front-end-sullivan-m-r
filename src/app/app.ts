import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './shared/components/layout/header/header';
import { Footer } from './shared/components/layout/footer/footer';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('sullivan-mor');
  hideShell = false;

  constructor(private router: Router) {
    // Chequeo inicial (para cuando carga directo en /login)
    this.checkRoute();

    // Chequeo en cada navegación
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.checkRoute());
  }

  private checkRoute(): void {
    const route = this.router.routerState.snapshot.root.firstChild;
    const hideByData = route?.data?.['hideShell'] ?? false;
    const hideByUrl = this.router.url.startsWith('/login');
    this.hideShell = hideByData || hideByUrl;
  }
}
