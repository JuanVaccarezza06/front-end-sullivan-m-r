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
  hideShell = signal(false); // ← SIGNAL, no propiedad normal

  constructor(private router: Router) {
    this.checkRoute();

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.checkRoute());
  }

  private checkRoute(): void {
    const url = this.router.url;
    this.hideShell.set(
      url.startsWith('/login') ||
        url.startsWith('/auth/login') ||
        url.startsWith('/register') ||
        url.startsWith('/auth/register'),
    );
  }
}
