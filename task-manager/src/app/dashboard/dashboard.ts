import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCard } from './components/stat-card/stat-card';
import { TaskService } from '../core/services/task';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, StatCard,MatProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private taskService = inject(TaskService);
  statistics = this.taskService.statisticsResource;
}
