import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StatCard } from './components/stat-card/stat-card';
import { TaskService } from '../core/services/task';
import { SearchService } from '../core/services/search';
import { Spinner } from '../shared/spinner/spinner';
import { DashboardToolbar } from './components/toolbar/toolbar';
import { NoData } from '../shared/no-data/no-data';
import { TaskBoard } from './components/task-board/task-board';
import { RecentActivity } from './components/recent-activity/recent-activity';
import { Task } from '../core/models/task.model';
import { TaskFormDialog } from '../shared/dialogs/task-form-dialog/task-form-dialog';
import { ConfirmDialog } from '../shared/dialogs/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, StatCard, Spinner, NoData, DashboardToolbar, TaskBoard, RecentActivity, MatDialogModule, MatSnackBarModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private taskService = inject(TaskService);
  searchService = inject(SearchService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  statistics = this.taskService.statisticsResource;
  tasks = this.taskService.tasksResource;
  selectedStatus = signal<string>('all');
  selectedPriority = signal<string>('all');
  selectedAssignees = signal<string[]>([]);

  onTaskMoved({ task, newStatus }: { task: Task, newStatus: string }) {
    this.taskService.updateTask(task.id, { status: newStatus as Task['status'] }).then(() => {
      this.snackBar.open(`Task moved to ${newStatus.replace('_', ' ').toUpperCase()}`, 'Close', { duration: 2000 });
    }).catch(err => {
      console.error('Failed to move task', err);
      this.snackBar.open('Failed to move task', 'Close', { duration: 3000, panelClass: 'error-snackbar' });
    });
  }

  onEditTask(task: Task) {
    const dialogRef = this.dialog.open(TaskFormDialog, {
      data: { task },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService.updateTask(task.id, result);
      }
    });
  }

  onDeleteTask(task: Task) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Task',
        message: `Are you sure you want to delete "${task.title}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService.deleteTask(task.id);
      }
    });
  }
}
