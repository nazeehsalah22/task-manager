import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { TaskService } from '../core/services/task';
import { SearchService } from '../core/services/search';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DashboardToolbar } from './components/toolbar/toolbar';
import { TaskBoard } from './components/task-board/task-board';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let mockTaskService: any;
  let mockStatsResource: any;
  let mockTasksResource: any;
  let mockDialog: any;
  let mockSnackBar: any;
  let mockSearchService: any;

  const getMockTask = (id: string) => ({
    id,
    title: `Task ${id}`,
    description: 'Desc',
    status: 'todo',
    priority: 'medium',
    isOverdue: false,
    dueDate: new Date().toISOString(),
    assignee: { id: 'u1', name: 'User 1', avatar: 'A' },
    tags: ['tag1']
  });

  beforeEach(async () => {
    const statsValueSignal = signal([{ id: 1, title: 'Tasks', value: 10, icon: 'task' }]);
    const statsIsLoadingSignal = signal(false);
    mockStatsResource = statsValueSignal as any;
    mockStatsResource.value = statsValueSignal;
    mockStatsResource.isLoading = statsIsLoadingSignal;
    mockStatsResource.error = signal(null);

    const tasksValueSignal = signal([getMockTask('1')]);
    const tasksIsLoadingSignal = signal(false);
    mockTasksResource = tasksValueSignal as any;
    mockTasksResource.value = tasksValueSignal;
    mockTasksResource.isLoading = tasksIsLoadingSignal;
    mockTasksResource.error = signal(null);

    mockTaskService = {
      statisticsResource: mockStatsResource,
      tasksResource: mockTasksResource,
      updateTask: vi.fn().mockResolvedValue({}),
      deleteTask: vi.fn().mockResolvedValue({})
    };

    mockDialog = { open: vi.fn().mockReturnValue({ afterClosed: () => of(null) }) };
    mockSnackBar = { open: vi.fn() };
    mockSearchService = { searchTerm: signal('') };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: TaskService, useValue: mockTaskService },
        { provide: SearchService, useValue: mockSearchService }
      ]
    })
    .overrideProvider(MatDialog, { useValue: mockDialog })
    .overrideProvider(MatSnackBar, { useValue: mockSnackBar })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Loading States', () => {
    it('should show spinner when statistics are loading', () => {
      mockStatsResource.isLoading.set(true);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('app-spinner'))).toBeTruthy();
    });

    it('should show spinner when tasks are loading', () => {
      mockTasksResource.isLoading.set(true);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('app-spinner'))).toBeTruthy();
    });
  });

  describe('Success States', () => {
    it('should show stat cards when statistics are available', () => {
      expect(fixture.debugElement.query(By.css('app-stat-card'))).toBeTruthy();
    });

    it('should show toolbar and board when tasks are available', () => {
      expect(fixture.debugElement.query(By.css('app-dashboard-toolbar'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('app-task-board'))).toBeTruthy();
    });
  });

  describe('Error/Empty States', () => {
    it('should show no-data when statistics are missing', () => {
      mockStatsResource.value.set(null);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('no-data'))).toBeTruthy();
    });

    it('should show no-data when tasks are missing', () => {
      mockTasksResource.value.set(null);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('no-data'))).toBeTruthy();
    });
  });

  describe('Toolbar Interactions', () => {
    it('should update selectedStatus from toolbar', () => {
      const toolbar = fixture.debugElement.query(By.directive(DashboardToolbar));
      toolbar.triggerEventHandler('statusChange', 'done');
      expect(component.selectedStatus()).toBe('done');
    });

    it('should update selectedPriority from toolbar', () => {
      const toolbar = fixture.debugElement.query(By.directive(DashboardToolbar));
      toolbar.triggerEventHandler('priorityChange', 'high');
      expect(component.selectedPriority()).toBe('high');
    });

    it('should update selectedAssignees from toolbar', () => {
      const toolbar = fixture.debugElement.query(By.directive(DashboardToolbar));
      toolbar.triggerEventHandler('assigneeChange', ['u1', 'u2']);
      expect(component.selectedAssignees()).toEqual(['u1', 'u2']);
    });
  });

  describe('Task events', () => {
    it('should edit task via TaskBoard edit event', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of({ title: 'New' }) });
      const taskBoard = fixture.debugElement.query(By.directive(TaskBoard));
      taskBoard.triggerEventHandler('edit', getMockTask('1'));
      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockTaskService.updateTask).toHaveBeenCalledWith('1', { title: 'New' });
    });

    it('should delete task via TaskBoard delete event', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });
      const taskBoard = fixture.debugElement.query(By.directive(TaskBoard));
      taskBoard.triggerEventHandler('delete', getMockTask('1'));
      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith('1');
    });

    it('should update task status via TaskBoard taskMoved event', async () => {
      const taskBoard = fixture.debugElement.query(By.directive(TaskBoard));
      taskBoard.triggerEventHandler('taskMoved', { task: getMockTask('1'), newStatus: 'done' });
      expect(mockTaskService.updateTask).toHaveBeenCalledWith('1', { status: 'done' });
      await vi.waitUntil(() => mockSnackBar.open.mock.calls.length > 0);
      expect(mockSnackBar.open).toHaveBeenCalledWith('Task moved to DONE', 'Close', { duration: 2000 });
    });
  });
});
