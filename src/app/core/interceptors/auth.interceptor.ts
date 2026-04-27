import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';

import { inject } from '@angular/core';

import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service/auth-service';
import { environment } from '../../../environments/environment.development';




export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();

    // TU URL DE BACKEND 
    const myApiUrl = environment.urlAPI;

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
            if (error.status === 401) {
                // Solo el 401 invalida realmente la sesión.
                if (isApiRequest) {
                    authService.logout();
                    router.navigate(['/login']);
                }
            }

            if (error.status === 403) {
                // Un 403 indica permiso insuficiente, pero no necesariamente sesión inválida.
                // Dejamos que la pantalla destino decida cómo comunicar el acceso denegado.
                console.warn('Acceso denegado por la API:', req.url);
            }
            return throwError(() => error);
        })
    );
};