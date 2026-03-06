import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { TaskCard } from '../task-card/task-card';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-board',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TaskCard, DragDropModule],
  templateUrl: './task-board.html',
  styleUrl: './task-board.scss',
})
export class TaskBoard {
  tasks = input.required<Task[]>();
  selectedStatus = input<string>('all');
  selectedPriority = input<string>('all');
  selectedAssignees = input<string[]>([]);
  searchTerm = input<string>('');

  taskMoved = output<{task: Task, newStatus: string}>();
  edit = output<Task>();
  delete = output<Task>();
  sortTasks = (tasks: Task[]) => {
    return tasks.sort((a, b) => {
      // Both overdue or both not overdue
      if (a.isOverdue === b.isOverdue) {
        // Sort chronologically ascending (oldest/closest due date first)
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      // Overdue tasks come first
      return a.isOverdue ? -1 : 1;
    });
  };

  drop(event: CdkDragDrop<Task[]>) {
    // If dropping into a different column
    if (event.previousContainer !== event.container) {
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = event.container.id; // Expecting 'todo', 'in_progress', or 'done'
      
      // Perform local optimistic array move for smooth UI until reload finishes
      const targetArray = event.container.data;
      targetArray.splice(event.currentIndex, 0, event.previousContainer.data.splice(event.previousIndex, 1)[0]);
      
      this.taskMoved.emit({ task, newStatus });
    } else {
       // Just visual reorder in same array
       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  todoTasks = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.sortTasks(
      this.tasks()
        .filter((t) => t.status === 'todo')
        .filter((t) => this.selectedPriority() === 'all' || t.priority === this.selectedPriority())
        .filter((t) => this.selectedAssignees().length === 0 || (t.assignee && this.selectedAssignees().includes(t.assignee.id)))
        .filter((t) => !term || t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term)),
    );
  });

  inProgressTasks = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.sortTasks(
      this.tasks()
        .filter((t) => t.status === 'in_progress')
        .filter((t) => this.selectedPriority() === 'all' || t.priority === this.selectedPriority())
        .filter((t) => this.selectedAssignees().length === 0 || (t.assignee && this.selectedAssignees().includes(t.assignee.id)))
        .filter((t) => !term || t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term)),
    );
  });

  doneTasks = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.sortTasks(
      this.tasks()
        .filter((t) => t.status === 'done')
        .filter((t) => this.selectedPriority() === 'all' || t.priority === this.selectedPriority())
        .filter((t) => this.selectedAssignees().length === 0 || (t.assignee && this.selectedAssignees().includes(t.assignee.id)))
        .filter((t) => !term || t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term)),
    );
  });
}
