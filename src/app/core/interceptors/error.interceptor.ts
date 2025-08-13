import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Error desconocido';
      
      if (error.error?.message) {
        // El backend ya envió un mensaje de error específico
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else if (error.status >= 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status === 401) {
        errorMessage = 'Token inválido o expirado';
        // El backend determinó que el token es inválido
        // Limpiar auth y redirigir a login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        
        // Solo redirigir si no estamos ya en login/register
        const currentUrl = window.location.pathname;
        if (!currentUrl.includes('/auth/')) {
          router.navigate(['/auth/login']);
        }
      } else if (error.status === 403) {
        errorMessage = 'Acceso denegado';
      }

      // Procesar errores de validación del backend
      if (error.status === 422 && error.error?.errors) {
        // VineJS devuelve errores en este formato
        const validationErrors = error.error.errors;
        
        // Formatear errores de validación para mejor UX
        if (Array.isArray(validationErrors)) {
          error.error.formattedErrors = validationErrors.map((err: any) => {
            const field = err.field || 'Campo';
            const message = err.message || err.rule || 'inválido';
            return `${field}: ${message}`;
          }).join(', ');
        } else if (typeof validationErrors === 'object') {
          // Si es un objeto con campos como keys
          error.error.formattedErrors = Object.entries(validationErrors)
            .map(([field, messages]: [string, any]) => {
              const fieldMessages = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${fieldMessages.join(', ')}`;
            })
            .join('; ');
        }
      }

      // Crear un error con la estructura esperada por el frontend
      const formattedError = {
        ...error,
        error: {
          ...error.error,
          message: errorMessage,
          success: false,
        },
      };

      return throwError(() => formattedError);
    })
  );
};
