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

  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === 'auth_token') {
        if (!event.newValue) {
          console.log('🚫 Token eliminado desde otra ventana');
          this.handleTokenRemoval();
        }
      }
    });

    let lastTokenExists = !!this.authService.getToken();
    setInterval(() => {
      const tokenExists = !!this.authService.getToken();
      
      if (lastTokenExists && !tokenExists) {
        console.log('🚫 Token eliminado del localStorage');
        this.handleTokenRemoval();
      }
      
      lastTokenExists = tokenExists;
    }, 5000);
  }
}
