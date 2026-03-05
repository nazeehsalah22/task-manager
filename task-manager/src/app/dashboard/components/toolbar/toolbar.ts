import { Component, output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap, startWith } from 'rxjs/operators';
import { from } from 'rxjs';
import { TaskService } from '../../../core/services/task';
import { TaskFormDialog } from '../../../shared/dialogs/task-form-dialog/task-form-dialog';

@Component({
  selector: 'app-dashboard-toolbar',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTabsModule, MatMenuModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatChipsModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class DashboardToolbar {
  statusChange = output<string>();
  priorityChange = output<string>();
  assigneeChange = output<string[]>();
  private dialog = inject(MatDialog);
  private taskService = inject(TaskService);
  
  assigneeSearchControl = new FormControl('');
  
  filteredAssignees = toSignal(
    this.assigneeSearchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(term => {
        if (!term || term.trim().length === 0) {
          return from([[]]);
        }
        return from(this.taskService.searchAssignees(term));
      })
    ),
    { initialValue: [] }
  );

  selectedAssignees = signal<string[]>([]);
  
  selectedAssigneesData = computed(() => {
    return this.selectedAssignees()
      .map(id => this.taskService.assignees.find(a => a.id === id))
      .filter((a): a is any => a !== undefined); // filter out possible undefined
  });
  
  toggleAssignee(id: string) {
    this.selectedAssignees.update(current => {
      const newSelection = current.includes(id) 
        ? current.filter(assigneeId => assigneeId !== id)
        : [...current, id];
      
      this.assigneeChange.emit(newSelection);
      return newSelection;
    });
  }

  removeAssignee(id: string) {
    this.selectedAssignees.update(current => {
      const newSelection = current.filter(assigneeId => assigneeId !== id);
      this.assigneeChange.emit(newSelection);
      return newSelection;
    });
  }

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
