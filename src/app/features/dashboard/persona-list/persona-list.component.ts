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
    // Sin validaciones en el frontend - todo se maneja en el backend
    this.personaForm = this.fb.group({
      nombre: [''],
      edad: [''],
      genero: ['']
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
    // No validamos en el frontend, enviamos directamente al backend
    this.isSubmitting = true;
    this.errorMessage = '';

    if (this.isEditing && this.editingPersonaId) {
      this.updatePersona();
    } else {
      this.createPersona();
    }
  }

  createPersona() {
    const formData = this.personaForm.value;
    // Convertir edad a número si no está vacía
    const personaData: CreatePersonaRequest = {
      nombre: formData.nombre?.trim() || '',
      edad: formData.edad ? Number(formData.edad) : 0,
      genero: formData.genero || ''
    };
    
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
        
        // Manejar errores de validación del backend
        if (error.error?.errors) {
          // Si hay errores de validación específicos
          if (error.error.formattedErrors) {
            this.errorMessage = error.error.formattedErrors;
          } else {
            this.errorMessage = 'Error de validación: ' + JSON.stringify(error.error.errors);
          }
        } else {
          this.errorMessage = error.error?.message || 'Error desconocido';
        }
      },
    });
  }

  updatePersona() {
    if (!this.editingPersonaId) return;

    const formData = this.personaForm.value;
    // Preparar datos para actualización, solo incluir campos que tienen valor
    const updateData: UpdatePersonaRequest = {};
    
    if (formData.nombre?.trim()) {
      updateData.nombre = formData.nombre.trim();
    }
    if (formData.edad) {
      updateData.edad = Number(formData.edad);
    }
    if (formData.genero) {
      updateData.genero = formData.genero;
    }

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
        
        // Manejar errores de validación del backend
        if (error.error?.errors) {
          if (error.error.formattedErrors) {
            this.errorMessage = error.error.formattedErrors;
          } else {
            this.errorMessage = 'Error de validación: ' + JSON.stringify(error.error.errors);
          }
        } else {
          this.errorMessage = error.error?.message || 'Error desconocido';
        }
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

}
