import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCard } from './task-card';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { Task } from '../../../core/models/task.model';

describe('TaskCard', () => {
  let component: TaskCard;
  let fixture: ComponentFixture<TaskCard>;

  const getMockTask = (overdue = false, daysDiff = 0): Task => {
    const due = new Date();
    due.setDate(due.getDate() + (overdue ? -daysDiff : daysDiff));
    return {
      id: '1',
      title: 'Test Task',
      description: 'Test Desc',
      status: 'todo',
      priority: 'high',
      isOverdue: overdue,
      dueDate: due.toISOString(),
      completedAt: null,
      assignee: { id: 'u1', name: 'User 1', avatar: 'A', email: 'u1@example.com' },
      tags: ['tag1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', getMockTask());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Output Events', () => {
    it('should emit edit event when editTask is called', () => {
      const emitSpy = vi.spyOn(component.edit, 'emit');
      component.editTask();
      expect(emitSpy).toHaveBeenCalledWith(component.task());
    });

    it('should emit delete event when deleteTask is called', () => {
      const emitSpy = vi.spyOn(component.delete, 'emit');
      component.deleteTask();
      expect(emitSpy).toHaveBeenCalledWith(component.task());
    });
  });

  describe('Computed Signals - overdueText', () => {
    it('should return empty string if not overdue', () => {
      fixture.componentRef.setInput('task', getMockTask(false, 1));
      expect(component.overdueText()).toBe('');
    });

    it('should return "Overdue" if overdue by 0 days (today)', () => {
      fixture.componentRef.setInput('task', getMockTask(true, 0));
      expect(component.overdueText()).toBe('Overdue');
    });

    it('should return "Overdue by 1 day" if overdue by 1 day', () => {
      fixture.componentRef.setInput('task', getMockTask(true, 1));
      expect(component.overdueText()).toBe('Overdue by 1 day');
    });

    it('should return "Overdue by 2 days" if overdue by 2 days', () => {
      fixture.componentRef.setInput('task', getMockTask(true, 2));
      expect(component.overdueText()).toBe('Overdue by 2 days');
    });
  });

  describe('Computed Signals - upcomingDueText', () => {
    it('should return empty string if overdue', () => {
      fixture.componentRef.setInput('task', getMockTask(true, 1));
      expect(component.upcomingDueText()).toBe('');
    });

    it('should return "Due today" if due today', () => {
      fixture.componentRef.setInput('task', getMockTask(false, 0));
      expect(component.upcomingDueText()).toBe('Due today');
    });

    it('should return "Due tomorrow" if due in 1 day', () => {
      fixture.componentRef.setInput('task', getMockTask(false, 1));
      expect(component.upcomingDueText()).toBe('Due tomorrow');
    });

    it('should return "Due in 1 week" if due in 7 days', () => {
      fixture.componentRef.setInput('task', getMockTask(false, 7));
      expect(component.upcomingDueText()).toBe('Due in 1 week');
    });

    it('should return "Due in X days" for others', () => {
      fixture.componentRef.setInput('task', getMockTask(false, 5));
      expect(component.upcomingDueText()).toBe('Due in 5 days');
    });
  });

  describe('Template Rendering', () => {
    it('should display priority badge', () => {
      const badge = fixture.debugElement.query(By.css('.priority-badge'));
      expect(badge.nativeElement.textContent).toContain('HIGH');
    });

    it('should display assignee avatar and name', () => {
      expect(fixture.debugElement.query(By.css('.avatar')).nativeElement.textContent).toBe('A');
      expect(fixture.debugElement.query(By.css('.name')).nativeElement.textContent).toBe('User 1');
    });
  });
});
