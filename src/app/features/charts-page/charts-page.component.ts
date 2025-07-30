import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChartsComponent } from '../dashboard/charts/charts.component';

@Component({
  selector: 'app-charts-page',
  standalone: true,
  imports: [CommonModule, ChartsComponent],
  templateUrl: './charts-page.component.html',
  styleUrl: './charts-page.component.css'
})
export class ChartsPageComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
