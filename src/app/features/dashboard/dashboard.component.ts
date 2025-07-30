import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PersonaService } from '../../core/services/persona.service';
import { User } from '../../core/models/user.model';
import { Persona } from '../../core/models/persona.model';
import { PersonaListComponent } from './persona-list/persona-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PersonaListComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  personas: Persona[] = [];
  isLoading = false;

  constructor(
    private authService: AuthService,
    private personaService: PersonaService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadPersonas();
  }

  loadUserData() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('Usuario actual:', user);
      console.log('Token en localStorage:', localStorage.getItem('auth_token'));
    });
  }

  loadPersonas() {
    this.isLoading = true;
    this.personaService.getAll().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.personas = response.data;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading personas:', error);
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Error during logout:', error);
        this.authService.clearAuth();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  onPersonaAdded() {
    this.loadPersonas();
  }

  onPersonaUpdated() {
    this.loadPersonas();
  }

  onPersonaDeleted() {
    this.loadPersonas();
  }

  goToAudit() {
    this.router.navigate(['/audit']);
  }
}
