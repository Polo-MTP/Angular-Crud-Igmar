import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuditService } from '../../core/services/audit.service';
import { AuthService } from '../../core/services/auth.service';
import { Audit, AuditFilters, AuditStats } from '../../core/models/audit.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.css',
})
export class AuditComponent implements OnInit {
  audits: Audit[] = [];
  stats: AuditStats | null = null;
  currentUser: User | null = null;
  isLoading = false;

  // Paginación
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;

  constructor(
    private auditService: AuditService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAudits();
    this.loadStats();
  }

  loadAudits() {
    this.isLoading = true;

    const filters: AuditFilters = {
      page: this.currentPage,
      limit: this.itemsPerPage,
    };

    // Limpiar valores vacíos
    Object.keys(filters).forEach((key) => {
      if (
        filters[key as keyof AuditFilters] === '' ||
        filters[key as keyof AuditFilters] === null
      ) {
        delete filters[key as keyof AuditFilters];
      }
    });

    this.auditService.getAudits(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.audits = response.data;
          this.totalPages = response.pagination.pages;
          this.totalItems = response.pagination.total;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading audits:', error);
      },
    });
  }

  loadStats() {
    this.auditService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      },
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAudits();
    }
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'CREATE':
        return '✅';
      case 'UPDATE':
        return '📝';
      case 'DELETE':
        return '🗑️';
      default:
        return '❓';
    }
  }

  getActionColor(action: string): string {
    switch (action) {
      case 'CREATE':
        return 'text-green-600';
      case 'UPDATE':
        return 'text-blue-600';
      case 'DELETE':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-ES');
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
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
      },
    });
  }
}
