import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });

    return next(authReq).pipe(
      catchError((error) => {
        if (error.status === 401) {
          console.log('🚫 Respuesta 401 - Token inválido o expirado');
          authService.clearAuth();
          router.navigate(['/auth/login']);
          console.log('Sesión expirada, redirigiendo al login...');
        }

        // Enriquecer el error con información adicional para mejor UX
        if (error.error && typeof error.error === 'object') {
          // Si el backend devuelve errores de validación estructurados
          if (error.error.errors && Array.isArray(error.error.errors)) {
            error.error.formattedErrors = error.error.errors.map((err: any) => {
              return `${err.field}: ${err.message}`;
            }).join(', ');
          }
        }

        return throwError(() => error);
      })
    );
  }

  return next(req);
};
