import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TokenMonitorService } from './core/services/token-monitor.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Sistema de Gestión de Personas';

  constructor(
    private tokenMonitorService: TokenMonitorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Iniciar monitoreo si el usuario está autenticado
    if (this.authService.isAuthenticated()) {
      this.tokenMonitorService.startMonitoring();
    }
  }

  ngOnDestroy(): void {
    // Detener monitoreo al destruir el componente
    this.tokenMonitorService.stopMonitoring();
  }
}
