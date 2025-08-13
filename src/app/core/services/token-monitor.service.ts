import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TokenMonitorService {
  constructor(private authService: AuthService, private router: Router) {
    this.setupStorageListener();
  }

  /**
   * Método simplificado que ya no hace monitoreo activo
   * Solo mantiene la interfaz para compatibilidad
   */
  startMonitoring(): void {
    console.log('🔄 Token monitor iniciado (validación delegada al backend)');
  }

  stopMonitoring(): void {
    console.log('⏹️ Token monitor detenido');
  }

  private handleTokenRemoval(): void {
    this.authService.clearAuth();
    
    const currentUrl = this.router.url;
    if (currentUrl !== '/auth/login' && currentUrl !== '/auth/register') {
      console.log('🚫 Token eliminado, redirigiendo a login...');
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Solo escucha cambios en el storage para detectar
   * cuando el token es eliminado manualmente
   */
  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === 'auth_token') {
        // Si el token fue eliminado desde otro tab/ventana
        if (!event.newValue) {
          console.log('🚫 Token eliminado desde otra ventana');
          this.handleTokenRemoval();
        }
      }
    });

    // Verificar solo si el token fue eliminado manualmente cada 5 segundos
    let lastTokenExists = !!this.authService.getToken();
    setInterval(() => {
      const tokenExists = !!this.authService.getToken();
      
      // Solo actuar si el token pasó de existir a no existir
      if (lastTokenExists && !tokenExists) {
        console.log('🚫 Token eliminado del localStorage');
        this.handleTokenRemoval();
      }
      
      lastTokenExists = tokenExists;
    }, 5000); // Verificar cada 5 segundos (menos frecuente)
  }
}
