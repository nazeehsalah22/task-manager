import { Injectable } from '@angular/core';
import { httpResource, HttpResponse } from '@angular/common/http';
import { Task } from '../models/task.model';
import { Statistic, StatisticsResponse } from '../models/statistic.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000';
  // Mock assignees for selection
  assignees = [
    { id: 'user-001', name: 'John Doe', avatar: 'JD', email: 'john.doe@company.com' },
    { id: 'user-002', name: 'Sarah Smith', avatar: 'SS', email: 'sarah.smith@company.com' },
    { id: 'user-003', name: 'Mike Johnson', avatar: 'MJ', email: 'mike.johnson@company.com' },
    { id: 'user-004', name: 'Emily Davis', avatar: 'ED', email: 'emily.davis@company.com' }
  ];

  // Using the new experimental HttpResource API available in Angular 19+
  tasksResource = httpResource<Task[]>(
    () => `${this.apiUrl}/tasks`,
    {
      parse: (response: any) => {
        return response.data;
      }
    }
  );
  statisticsResource = httpResource<StatisticsResponse>(
    () => `${this.apiUrl}/statistics`
  );
  async createTask(task: Partial<Task>): Promise<void> {
    const response = await fetch(`${this.apiUrl}/tasks`);
    const tasksData = await response.json();
    
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    tasksData.data.push(newTask);
    tasksData.meta.totalCount = tasksData.data.length;
    tasksData.meta.lastUpdated = new Date().toISOString();

    await fetch(`${this.apiUrl}/tasks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tasksData)
    });
    
    this.tasksResource.reload();
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const response = await fetch(`${this.apiUrl}/tasks`);
    const tasksData = await response.json();
    
    const index = tasksData.data.findIndex((t: Task) => t.id === id);
    if (index !== -1) {
      tasksData.data[index] = { 
        ...tasksData.data[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      
      await fetch(`${this.apiUrl}/tasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tasksData)
      });
      
      this.tasksResource.reload();
    }
  }

  async deleteTask(id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/tasks`);
    const tasksData = await response.json();
    
    tasksData.data = tasksData.data.filter((t: Task) => t.id !== id);
    tasksData.meta.totalCount = tasksData.data.length;
    tasksData.meta.lastUpdated = new Date().toISOString();
    
    await fetch(`${this.apiUrl}/tasks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tasksData)
    });
    
    this.tasksResource.reload();
  }
}
