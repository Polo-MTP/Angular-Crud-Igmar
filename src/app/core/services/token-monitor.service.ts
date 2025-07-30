import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TokenMonitorService {
  private monitorInterval: any;
  private isMonitoring = false;

  constructor(private authService: AuthService, private router: Router) {
    this.setupStorageListener();
  }

  /**
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('🔄 Iniciando monitoreo de token...');

    this.monitorInterval = setInterval(() => {
      this.checkTokenValidity();
    }, 30000);
  }

  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      this.isMonitoring = false;
      console.log('⏹️ Monitoreo de token detenido');
    }
  }

  private checkTokenValidity(): void {
    const token = this.authService.getToken();

    if (!token) {
      console.log('🚫 No hay token, redirigiendo a login...');
      this.handleInvalidToken();
      return;
    }

    if (!this.authService.isTokenValid(token)) {
      console.log('🚫 Token inválido detectado, redirigiendo a login...');
      this.handleInvalidToken();
      return;
    }

    console.log('✅ Token válido - monitoreo continuo');
  }

  private handleInvalidToken(): void {
    this.authService.clearAuth();
    this.stopMonitoring();

    const currentUrl = this.router.url;
    if (currentUrl !== '/auth/login' && currentUrl !== '/auth/register') {
      this.router.navigate(['/auth/login']);
    }
  }

  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === 'auth_token') {
        const newToken = event.newValue;

        if (!newToken || !this.authService.isTokenValid(newToken)) {
          console.log(
            '🚫 Token eliminado o modificado desde fuera, redirigiendo a login...'
          );
          this.handleInvalidToken();
        }
      }
    });

    let lastToken = this.authService.getToken();
    setInterval(() => {
      const currentToken = this.authService.getToken();

      if (lastToken !== currentToken) {
        lastToken = currentToken;

        if (!currentToken || !this.authService.isTokenValid(currentToken)) {
          console.log(
            '🚫 Token modificado o eliminado, redirigiendo a login...'
          );
          this.handleInvalidToken();
        }
      }
    }, 1000); // Verificar cada segundo
  }
}
