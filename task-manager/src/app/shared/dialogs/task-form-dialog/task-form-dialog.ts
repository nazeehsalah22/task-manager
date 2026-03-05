import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task';

export interface TaskDialogData {
  task?: Task; // If provided, it's Edit mode
}

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  templateUrl: './task-form-dialog.html',
  styleUrl: './task-form-dialog.scss',
})
export class TaskFormDialog {
  taskForm: FormGroup;
  isEditMode: boolean;

  assignees: any[];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskFormDialog>,
    private taskService: TaskService,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData
  ) {
    this.isEditMode = !!data?.task;
    this.assignees = this.taskService.assignees;

    this.taskForm = this.fb.group({
      title: [data?.task?.title || '', Validators.required],
      description: [data?.task?.description || '', Validators.required],
      status: [data?.task?.status || 'todo', Validators.required],
      priority: [data?.task?.priority || 'medium', Validators.required],
      dueDate: [data?.task?.dueDate ? new Date(data.task.dueDate) : new Date(), Validators.required],
      assigneeId: [data?.task?.assignee?.id || '', Validators.required],
    });
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const selectedAssignee = this.assignees.find(a => a.id === formValue.assigneeId);
      
      const result: Partial<Task> = {
        title: formValue.title,
        description: formValue.description,
        status: formValue.status,
        priority: formValue.priority,
        dueDate: formValue.dueDate.toISOString().split('T')[0],
        assignee: selectedAssignee,
        tags: this.data?.task?.tags || ['General'],
        isOverdue: false
      };
      
      this.dialogRef.close(result);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
