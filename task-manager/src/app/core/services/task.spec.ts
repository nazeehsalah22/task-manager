import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskService } from './task';
import { vi } from 'vitest';
import { environment } from '../../../environments/environment';

describe('TaskService', () => {
  let service: TaskService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TaskService);
    httpTesting = TestBed.inject(HttpTestingController);
    
    // Mock the reload method on tasksResource
    service.tasksResource = {
      reload: vi.fn()
    } as any;
  });

  afterEach(() => {
    // Flush the initial requests made by the httpResource signals
    const taskReqs = httpTesting.match(`${environment.apiUrl}/tasks`);
    taskReqs.forEach(req => req.flush([]));
    
    const statReqs = httpTesting.match(`${environment.apiUrl}/statistics`);
    statReqs.forEach(req => req.flush({}));
    
    httpTesting.verify();
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchAssignees', () => {
    it('should return matching assignees', async () => {
      const results = await service.searchAssignees('John');
      expect(results.length).toBe(2);
      expect(results[0].name).toBe('John Doe');
      expect(results[1].name).toBe('Mike Johnson');
    });

    it('should return all assignees on empty string', async () => {
      const results = await service.searchAssignees('');
      expect(results.length).toBe(4);
    });

    it('should return empty array if no match', async () => {
      const results = await service.searchAssignees('ZZZ');
      expect(results.length).toBe(0);
    });
  });

  describe('CRUD operations', () => {
    it('should create a new task', async () => {
      const promise = service.createTask({ title: 'New Task', description: 'Test' });
      
      const req = httpTesting.expectOne(`${environment.apiUrl}/tasks`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.title).toBe('New Task');
      req.flush({});
       
      await promise;
      expect(service.tasksResource.reload).toHaveBeenCalled();
    });

    it('should update an existing task', async () => {
      const promise = service.updateTask('task-1', { title: 'Updated Title' });

      const req = httpTesting.expectOne(`${environment.apiUrl}/tasks/task-1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body.title).toBe('Updated Title');
      req.flush({});

      await promise;
      expect(service.tasksResource.reload).toHaveBeenCalled();
    });

    it('should delete an existing task', async () => {
      const promise = service.deleteTask('task-1');

      const req = httpTesting.expectOne(`${environment.apiUrl}/tasks/task-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      await promise;
      expect(service.tasksResource.reload).toHaveBeenCalled();
    });
  });
});
