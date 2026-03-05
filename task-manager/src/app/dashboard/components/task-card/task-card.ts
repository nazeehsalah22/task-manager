import { Component, input, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task';
import { TaskFormDialog } from '../../../shared/dialogs/task-form-dialog/task-form-dialog';
import { ConfirmDialog } from '../../../shared/dialogs/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-task-card',
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule, MatMenuModule, MatDialogModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
  task = input.required<Task>();
  private dialog = inject(MatDialog);
  private taskService = inject(TaskService);

  editTask() {
    const dialogRef = this.dialog.open(TaskFormDialog, {
      data: { task: this.task() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService.updateTask(this.task().id, result);
      }
    });
  }

  deleteTask() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Task',
        message: `Are you sure you want to delete "${this.task().title}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService.deleteTask(this.task().id);
      }
    });
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
