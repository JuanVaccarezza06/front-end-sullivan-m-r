import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

// 1. Importas las utilidades de localización y el paquete de Argentina
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

registerLocaleData(localeEsAr, 'es-AR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled', // Esto hace la magia (top)
        anchorScrolling: 'enabled',           // Opcional: permite usar anclas #id
      })
    ),
    provideHttpClient(
      withInterceptors([ authInterceptor ]) 
    ),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'es-AR' }

  ]
};
