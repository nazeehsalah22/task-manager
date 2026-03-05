import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TaskService } from '../../../core/services/task';
import { TaskFormDialog } from '../../../shared/dialogs/task-form-dialog/task-form-dialog';

@Component({
  selector: 'app-dashboard-toolbar',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTabsModule, MatMenuModule, MatDialogModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class DashboardToolbar {
  statusChange = output<string>();
  priorityChange = output<string>();
  private dialog = inject(MatDialog);
  private taskService = inject(TaskService);
  statuses = ['all', 'todo', 'in_progress', 'done'];
  onTabChange(index: number) {
    this.statusChange.emit(this.statuses[index]);
  }

  createTask() {
    const dialogRef = this.dialog.open(TaskFormDialog, {
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService.createTask(result);
      }
    });
  }
}
