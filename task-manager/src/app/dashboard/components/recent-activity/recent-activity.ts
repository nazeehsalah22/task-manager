import { Component, computed, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-recent-activity',
  imports: [CommonModule, MatListModule, MatIconModule, DatePipe],
  templateUrl: './recent-activity.html',
  styleUrl: './recent-activity.scss',
})
export class RecentActivity {
  tasks = input.required<Task[]>();

  recentActivities = computed(() => {
    const allTasks = this.tasks() || [];
    
    const sorted = [...allTasks].sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return sorted.slice(0, 10).map(task => {
      const isNew = task.createdAt === task.updatedAt;
      const actionStr = isNew ? 'created the task' : 'updated the task';

      return {
        id: task.id,
        title: task.title,
        assigneeName: task.assignee ? task.assignee.name : 'Unknown User',
        assigneeAvatar: task.assignee ? task.assignee.avatar : '',
        action: actionStr,
        timestamp: task.updatedAt
      };
    });
  });
}
