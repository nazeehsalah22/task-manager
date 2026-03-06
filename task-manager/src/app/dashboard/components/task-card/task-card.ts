import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule, MatMenuModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
  task = input.required<Task>();
  edit = output<Task>();
  delete = output<Task>();

  editTask() {
    this.edit.emit(this.task());
  }

  deleteTask() {
    this.delete.emit(this.task());
  }

  overdueText = computed(() => {
    if (!this.task().isOverdue) return '';
    const due = new Date(this.task().dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Overdue';
    return `Overdue by ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  });

  upcomingDueText = computed(() => {
    if (this.task().isOverdue) return '';
    const due = new Date(this.task().dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays === 7) return 'Due in 1 week';
    return `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  });
}
