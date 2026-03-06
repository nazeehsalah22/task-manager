import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { form, required, minLength, maxLength, FormField, FormRoot } from '@angular/forms/signals';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { TaskFormModel, TaskDialogData } from '../../../core/models/task-form.model';
import { TaskService } from '../../../core/services/task';

@Component({
  selector: 'app-task-form-dialog',
  imports: [
    CommonModule,
    FormField,
    FormRoot,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormDialog {
  private readonly dialogRef = inject(MatDialogRef<TaskFormDialog>);
  private readonly taskService = inject(TaskService);
  protected readonly data = inject<TaskDialogData>(MAT_DIALOG_DATA);
  readonly isEditMode = signal(!!this.data?.task);
  readonly assignees = signal(this.taskService.assignees);
  readonly taskModel = signal<TaskFormModel>({
    title: this.data?.task?.title ?? '',
    description: this.data?.task?.description ?? '',
    status: this.data?.task?.status ?? 'todo',
    priority: this.data?.task?.priority ?? 'medium',
    dueDate: this.data?.task?.dueDate ? new Date(this.data.task.dueDate) : new Date(),
    assigneeId: this.data?.task?.assignee?.id ?? '',
  });

  readonly taskForm = form(
    this.taskModel,
    (schema) => {
      required(schema.title, { message: 'Title is required' });
      minLength(schema.title, 3, { message: 'Title must be at least 3 characters' });
      maxLength(schema.title, 100, { message: 'Title cannot exceed 100 characters' });
      required(schema.description, { message: 'Description is required' });
      maxLength(schema.description, 500, { message: 'Description cannot exceed 500 characters' });
      required(schema.status, { message: 'Status is required' });
      required(schema.priority, { message: 'Priority is required' });
      required(schema.dueDate, { message: 'Due Date is required' });
      required(schema.assigneeId, { message: 'Assignee is required' });
    }
  );

  onSubmit(): void {
    if (this.taskForm().invalid()) return;
    const formValue = this.taskForm().value();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(formValue.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    this.dialogRef.close({
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
      priority: formValue.priority,
      dueDate: formValue.dueDate.toISOString().split('T')[0],
      assignee: this.assignees().find(a => a.id === formValue.assigneeId),
      tags: this.data?.task?.tags ?? ['General'],
      isOverdue: dueDate < today
    });
  }
  onCancel(): void {
    this.dialogRef.close();
  }
}
