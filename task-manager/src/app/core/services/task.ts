import { Injectable, inject } from '@angular/core';
import { httpResource, HttpResponse, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Task } from '../models/task.model';
import { Statistic } from '../models/statistic.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  // Mock assignees for selection
  assignees = [
    { id: 'user-001', name: 'John Doe', avatar: 'JD', email: 'john.doe@company.com' },
    { id: 'user-002', name: 'Sarah Smith', avatar: 'SS', email: 'sarah.smith@company.com' },
    { id: 'user-003', name: 'Mike Johnson', avatar: 'MJ', email: 'mike.johnson@company.com' },
    { id: 'user-004', name: 'Emily Davis', avatar: 'ED', email: 'emily.davis@company.com' }
  ];

  // Simulates a backend call to search assignees with network delay
  async searchAssignees(term: string): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerTerm = term.toLowerCase();
        const results = this.assignees.filter((a) =>
          a.name.toLowerCase().includes(lowerTerm)
        );
        resolve(results);
      }, 500); // 500ms mock delay
    });
  }

  // Using the new experimental HttpResource API available in Angular 19+
  tasksResource = httpResource<Task[]>(
    () => `${this.apiUrl}/tasks`
  );
  statisticsResource = httpResource<Statistic[]>(
    () => `${this.apiUrl}/statistics`
  );
  async createTask(task: Partial<Task>): Promise<void> {
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await firstValueFrom(this.http.post(`${this.apiUrl}/tasks`, newTask));
    this.tasksResource.reload();
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    await firstValueFrom(this.http.patch(`${this.apiUrl}/tasks/${id}`, {
      ...updates,
      updatedAt: new Date().toISOString()
    }));
    this.tasksResource.reload();
  }

  async deleteTask(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/tasks/${id}`));
    this.tasksResource.reload();
  }
}
