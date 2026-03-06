import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskBoard } from './task-board';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { Task } from '../../../core/models/task.model';

describe('TaskBoard', () => {
  let component: TaskBoard;
  let fixture: ComponentFixture<TaskBoard>;

  const mockTasks: any[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Desc 1',
      status: 'todo',
      priority: 'high',
      isOverdue: true,
      dueDate: new Date(Date.now() - 86400000).toISOString(),
      assignee: { id: 'u1', name: 'Alice', avatar: 'A' },
      tags: ['bug']
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskBoard],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskBoard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tasks', mockTasks);
    fixture.componentRef.setInput('searchTerm', '');
    fixture.componentRef.setInput('selectedStatus', 'all');
    fixture.componentRef.setInput('selectedPriority', 'all');
    fixture.componentRef.setInput('selectedAssignees', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Filtering and Sorting', () => {
    it('should split tasks by status and filter by all criteria', () => {
      fixture.componentRef.setInput('tasks', [
        { ...mockTasks[0], id: '1', status: 'todo', title: 'FindMe' },
        { ...mockTasks[0], id: '2', status: 'in_progress', priority: 'low' },
        { ...mockTasks[0], id: '3', status: 'done', assignee: { id: 'uX', name: 'X' } }
      ]);
      fixture.componentRef.setInput('searchTerm', 'FindMe');
      fixture.detectChanges();
      expect(component.todoTasks().length).toBe(1);
      expect(component.inProgressTasks().length).toBe(0);
      expect(component.doneTasks().length).toBe(0);

      fixture.componentRef.setInput('searchTerm', '');
      fixture.componentRef.setInput('selectedPriority', 'high');
      fixture.detectChanges();
      expect(component.todoTasks().length).toBe(1);
      expect(component.inProgressTasks().length).toBe(0);

      fixture.componentRef.setInput('selectedPriority', 'all');
      fixture.componentRef.setInput('selectedAssignees', ['u1']);
      fixture.detectChanges();
      expect(component.todoTasks().length).toBe(1);
      expect(component.doneTasks().length).toBe(0);
      
      // Hit branches where term matches description but not title
      fixture.componentRef.setInput('searchTerm', 'Desc 1');
      fixture.detectChanges();
      expect(component.todoTasks().length).toBe(1);
    });

    it('should sort tasks correctly (overdue/dates)', () => {
      const date1 = '2020-01-01';
      const date2 = '2020-02-01';
      const date3 = '2025-01-01';
      
      const t1 = { id: '1', isOverdue: true, dueDate: date1 } as Task;
      const t2 = { id: '2', isOverdue: true, dueDate: date2 } as Task;
      const t3 = { id: '3', isOverdue: false, dueDate: date3 } as Task;

      // Overdue vs Not Overdue
      expect(component.sortTasks([{ ...t3 }, { ...t1 }])[0].id).toBe('1');
      expect(component.sortTasks([{ ...t1 }, { ...t3 }])[0].id).toBe('1');

      // Both Overdue (sorted by date)
      const sortedOverdue = component.sortTasks([{ ...t2 }, { ...t1 }]);
      expect(sortedOverdue[0].id).toBe('1');

      // Both Not Overdue (sorted by date)
      const t4 = { id: '4', isOverdue: false, dueDate: '2025-02-01' } as Task;
      const sortedActive = component.sortTasks([{ ...t4 }, { ...t3 }]);
      expect(sortedActive[0].id).toBe('3');
      
      // Same date same overdue (branch coverage)
      const t5 = { id: '5', isOverdue: false, dueDate: '2025-01-01' } as Task;
      expect(component.sortTasks([{ ...t3 }, { ...t5 }]).length).toBe(2);
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drop into each container and emit taskMoved', async () => {
      const statuses: ('todo' | 'in_progress' | 'done')[] = ['todo', 'in_progress', 'done'];
      const containers = ['#todo', '#in_progress', '#done'];
      
      const emitSpy = vi.spyOn(component.taskMoved, 'emit');

      for (let i = 0; i < containers.length; i++) {
        const task = { ...mockTasks[0], id: `task-${i}` };
        const event = {
          previousContainer: { id: 'other', data: [task] },
          container: { id: statuses[i], data: [] } as any,
          previousIndex: 0,
          currentIndex: 0
        } as any;

        const list = fixture.debugElement.query(By.css(containers[i]));
        list.triggerEventHandler('cdkDropListDropped', event);
        
        expect(emitSpy).toHaveBeenCalledWith({ task, newStatus: statuses[i] });
      }
    });

    it('should reorder in same container (moveItemInArray)', () => {
      const data = [{...mockTasks[0]}, { ...mockTasks[0], id: '2' }];
      const container = { id: 'todo', data };
      const event = {
        previousContainer: container,
        container: container,
        previousIndex: 0,
        currentIndex: 1
      } as any;

      component.drop(event);
      expect(data[0].id).toBe('2');
    });
  });

  describe('Template Visibility', () => {
    it('should show only specific columns when selectedStatus is set', () => {
      const statuses: ('todo' | 'in_progress' | 'done')[] = ['todo', 'in_progress', 'done'];
      
      statuses.forEach(status => {
         fixture.componentRef.setInput('selectedStatus', status);
         fixture.detectChanges();
         const columns = fixture.debugElement.queryAll(By.css('.board-column'));
         expect(columns.length).toBe(1);
         const content = columns[0].query(By.css('.column-content'));
         expect(content.nativeNode.id).toBe(status);
      });
    });
  });
});
