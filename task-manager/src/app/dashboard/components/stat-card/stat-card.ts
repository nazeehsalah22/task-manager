import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Statistic } from '../../../core/models/statistic.model';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  stat = input.required<Statistic>();
}
