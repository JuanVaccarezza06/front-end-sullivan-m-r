import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';

import { inject } from '@angular/core';

import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth-service/auth-service';




export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();

    // TU URL DE BACKEND (Idealmente vendría de environment.apiUrl)
    const myApiUrl = 'localhost:8080';

    // 1. VERIFICACIÓN DE SEGURIDAD
    // Solo adjuntamos el token si la petición va a NUESTRO backend
    // y si tenemos un token guardado.
    const isApiRequest = req.url.includes(myApiUrl);

    let authReq = req;

    if (token && isApiRequest) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    // 2. MANEJO DE ERRORES (Igual que antes)
    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 || error.status === 403) {
                // Solo deslogueamos si el error viene de NUESTRA API
                // Si falla una API externa, no queremos sacar al usuario.
                if (isApiRequest) {
                    authService.logout();
                    router.navigate(['/login']);
                }
            }
            return throwError(() => error);
        })
    );
};