import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { TokenMonitorService } from '../../../core/services/token-monitor.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private tokenMonitorService: TokenMonitorService
  ) {
    // Sin validaciones en el frontend - todo se maneja en el backend
    this.loginForm = this.fb.group({
      email: [''],
      password: [''],
    });
  }

  onSubmit() {
    // No validamos en el frontend, enviamos directamente al backend
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.tokenMonitorService.startMonitoring();
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;

        // Manejar errores de validación del backend
        if (error.error?.errors) {
          if (error.error.formattedErrors) {
            this.errorMessage = error.error.formattedErrors;
          } else {
            this.errorMessage =
              'Error de validación: ' + JSON.stringify(error.error.errors);
          }
        } else {
          this.errorMessage = error.error?.message || 'Error desconocido';
        }
      },
    });
  }
}
