import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonaService } from '../../../core/services/persona.service';
import { Persona } from '../../../core/models/persona.model';

interface ChartData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface AgeGenderData {
  hombresMenores: number;
  hombresMayores: number;
  mujeresMenores: number;
  mujeresMayores: number;
}

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.css'
})
export class ChartsComponent implements OnInit {
  personas: Persona[] = [];
  isLoading = false;

  // Datos para la primera gráfica (género)
  genderData: ChartData[] = [];

  // Datos para la segunda gráfica (edad)
  ageData: ChartData[] = [];

  // Datos para la tercera gráfica (combinación)
  combinedData: ChartData[] = [];

  constructor(private personaService: PersonaService) {}

  ngOnInit() {
    this.loadPersonas();
  }

  loadPersonas() {
    this.isLoading = true;
    this.personaService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.personas = response.data;
          this.calculateChartData();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading personas:', error);
        this.isLoading = false;
      }
    });
  }

  calculateChartData() {
    const total = this.personas.length;
    
    if (total === 0) {
      this.genderData = [];
      this.ageData = [];
      this.combinedData = [];
      return;
    }

    // Contadores
    let hombres = 0;
    let mujeres = 0;
    let menores = 0;
    let mayores = 0;
    let hombresMenores = 0;
    let hombresMayores = 0;
    let mujeresMenores = 0;
    let mujeresMayores = 0;

    this.personas.forEach(persona => {
      const edad = parseInt(persona.edad.toString());
      const esMenor = edad < 18;

      // Conteo por género
      if (persona.genero === 'masculino') {
        hombres++;
        if (esMenor) {
          hombresMenores++;
        } else {
          hombresMayores++;
        }
      } else {
        mujeres++;
        if (esMenor) {
          mujeresMenores++;
        } else {
          mujeresMayores++;
        }
      }

      // Conteo por edad
      if (esMenor) {
        menores++;
      } else {
        mayores++;
      }
    });

    // Primera gráfica: Por género
    this.genderData = [
      {
        label: 'Hombres',
        value: hombres,
        percentage: (hombres / total) * 100,
        color: '#3498db'
      },
      {
        label: 'Mujeres',
        value: mujeres,
        percentage: (mujeres / total) * 100,
        color: '#e74c3c'
      }
    ];

    // Segunda gráfica: Por edad
    this.ageData = [
      {
        label: 'Menores de 18',
        value: menores,
        percentage: (menores / total) * 100,
        color: '#f39c12'
      },
      {
        label: 'Mayores de 18',
        value: mayores,
        percentage: (mayores / total) * 100,
        color: '#27ae60'
      }
    ];

    // Tercera gráfica: Combinación género + edad
    this.combinedData = [
      {
        label: 'Hombres menores',
        value: hombresMenores,
        percentage: (hombresMenores / total) * 100,
        color: '#3498db'
      },
      {
        label: 'Hombres mayores',
        value: hombresMayores,
        percentage: (hombresMayores / total) * 100,
        color: '#2980b9'
      },
      {
        label: 'Mujeres menores',
        value: mujeresMenores,
        percentage: (mujeresMenores / total) * 100,
        color: '#e74c3c'
      },
      {
        label: 'Mujeres mayores',
        value: mujeresMayores,
        percentage: (mujeresMayores / total) * 100,
        color: '#c0392b'
      }
    ];
  }

  getTotalPersonas(): number {
    return this.personas.length;
  }
}
