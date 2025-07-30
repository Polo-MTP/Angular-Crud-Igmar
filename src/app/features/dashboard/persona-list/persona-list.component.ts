import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { PersonaService } from '../../../core/services/persona.service';
import {
  Persona,
  CreatePersonaRequest,
  UpdatePersonaRequest,
} from '../../../core/models/persona.model';

@Component({
  selector: 'app-persona-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './persona-list.component.html',
  styleUrl: './persona-list.component.css',
})
export class PersonaListComponent implements OnChanges {
  @Input() personas: Persona[] = [];
  @Input() isLoading = false;
  @Output() personaAdded = new EventEmitter<void>();
  @Output() personaUpdated = new EventEmitter<void>();
  @Output() personaDeleted = new EventEmitter<void>();

  personaForm: FormGroup;
  isFormVisible = false;
  isEditing = false;
  editingPersonaId: number | null = null;
  isSubmitting = false;
  errorMessage = '';

  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;

  constructor(private fb: FormBuilder, private personaService: PersonaService) {
    this.personaForm = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-ZÀ-ſ\s]+$/), // Solo letras, espacios y acentos
        ],
      ],
      edad: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.max(120),
          Validators.pattern(/^\d+$/), // Solo números enteros
        ],
      ],
      genero: ['', [Validators.required]],
    });
  }

  showAddForm() {
    this.isFormVisible = true;
    this.isEditing = false;
    this.editingPersonaId = null;
    this.personaForm.reset();
    this.errorMessage = '';
  }

  showEditForm(persona: Persona) {
    this.isFormVisible = true;
    this.isEditing = true;
    this.editingPersonaId = persona.id;
    this.personaForm.patchValue({
      nombre: persona.nombre,
      edad: persona.edad,
      genero: persona.genero,
    });
    this.errorMessage = '';
  }

  hideForm() {
    this.isFormVisible = false;
    this.isEditing = false;
    this.editingPersonaId = null;
    this.personaForm.reset();
    this.errorMessage = '';
  }

  onSubmit() {
    if (this.personaForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      if (this.isEditing && this.editingPersonaId) {
        this.updatePersona();
      } else {
        this.createPersona();
      }
    }
  }

  createPersona() {
    const formData = this.personaForm.value;
    const personaData: CreatePersonaRequest = this.personaForm.value;
    console.log('Enviando datos de persona:', personaData);
    console.log('Token en localStorage:', localStorage.getItem('auth_token'));

    this.personaService.create(personaData).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.isSubmitting = false;
        if (response.success) {
          this.hideForm();
          this.personaAdded.emit();
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        console.error('Error completo:', error);
        this.isSubmitting = false;
        this.errorMessage = this.getDetailedErrorMessage(error);
      },
    });
  }

  updatePersona() {
    if (!this.editingPersonaId) return;

    const updateData: UpdatePersonaRequest = this.personaForm.value;

    this.personaService.update(this.editingPersonaId, updateData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.hideForm();
          this.personaUpdated.emit();
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = this.getDetailedErrorMessage(error);
      },
    });
  }

  deletePersona(persona: Persona) {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${persona.nombre}?`)) {
      this.personaService.delete(persona.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.personaDeleted.emit();
          }
        },
        error: (error) => {
          console.error('Error al eliminar persona:', error);
        },
      });
    }
  }

  // Métodos de paginación
  ngOnChanges(changes: SimpleChanges) {
    if (changes['personas']) {
      this.totalItems = this.personas.length;
      // Resetear a la primera página si cambian los datos
      this.currentPage = 1;
    }
  }

  paginatedPersonas(): Persona[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.personas.slice(startIndex, endIndex);
  }

  totalPages(): number {
    return Math.ceil(this.personas.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  private getDetailedErrorMessage(error: any): string {
    // Usar el formattedErrors del interceptor si está disponible
    if (error.error?.formattedErrors) {
      return `Errores de validación: ${error.error.formattedErrors}`;
    }

    // Errores de validación del backend (fallback)
    if (error.error?.errors && Array.isArray(error.error.errors)) {
      const validationErrors = error.error.errors.map((err: any) => {
        return `${err.field}: ${err.message}`;
      }).join(', ');
      return `Errores de validación: ${validationErrors}`;
    }

    // Errores HTTP específicos
    switch (error.status) {
      case 400:
        return error.error?.message || 'Datos inválidos. Verifica los campos ingresados.';
      case 401:
        return 'No estás autenticado. Inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 409:
        return 'Conflicto: Ya existe un registro con estos datos.';
      case 422:
        return 'Datos no válidos. Verifica los campos requeridos.';
      case 500:
        return 'Error en el servidor. Verifica que el backend esté funcionando.';
      default:
        return error.error?.message || `Error ${error.status}: ${error.statusText}` || 'Error desconocido';
    }
  }
}
