import { Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-card',
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule, DatePipe],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
  task = input.required<Task>();
}
