import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskCard } from '../task-card/task-card';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-board',
  imports: [CommonModule, TaskCard],
  templateUrl: './task-board.html',
  styleUrl: './task-board.scss',
})
export class TaskBoard {
  tasks = input.required<Task[]>();
  todoTasks = computed(() => this.tasks().filter(t => t.status === 'todo'));
  inProgressTasks = computed(() => this.tasks().filter(t => t.status === 'in_progress'));
  doneTasks = computed(() => this.tasks().filter(t => t.status === 'done'));
}
