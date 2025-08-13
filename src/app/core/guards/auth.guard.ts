import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (!token) {
    console.log('🚫 No hay token, redirigiendo a login');
    router.navigate(['/auth/login']);
    return false;
  }

  // Solo verificar existencia del token
  // La validación real la hace el backend vía interceptores
  console.log('✅ Token presente, permitiendo acceso');
  return true;
};

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (token) {
    // Si hay token, asumimos que está autenticado
    // Si el token es inválido, el backend lo manejará
    console.log('✅ Token presente, redirigiendo a dashboard');
    router.navigate(['/dashboard']);
    return false;
  }

  console.log('✅ Sin token, permitiendo acceso a página pública');
  return true;
};
