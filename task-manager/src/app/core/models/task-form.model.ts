import { Task, TaskPriority, TaskStatus } from './task.model';

export interface TaskDialogData {
  task?: Task;
}


export interface TaskFormModel {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  assigneeId: string;
}
