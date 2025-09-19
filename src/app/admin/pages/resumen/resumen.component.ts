import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

import { TasksService, Task } from '../../../core/services/tasks.service';
import { SubtasksService } from '../../../core/services/subtasks.service';
import { ProjectsService } from '../../../core/services/projects.service';
import { UsersService } from '../../../core/services/users.service';
import { LoginService } from '../../../auth/services/login.service';
import { Subtask } from '../../../core/model/subtask.model';
import { User } from '../../../core/model/user.model';

@Component({
  selector: 'app-resumen',
  standalone: true,
  templateUrl: './resumen.component.html',
  styleUrl: './resumen.component.css',
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumenComponent implements OnInit {
  userName = '';
  projectName = '';
  projectCliente = 0;
  projectProgreso = 0;
  projectTiempoEstimado = '';
  projectMiembros: number[] = [];
  miembroNombres: { [id: number]: string } = {};
  projectDescripcion = '';
  tareasProximas: Task[] = [];
  allTasks: Task[] = [];
  userId = '';
  projectId: number | null = null;
  loading = true;
  subtasksByTaskId = signal<{ [taskId: number]: Subtask[] }>({});

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsService,
    private tasksService: TasksService,
    private usersService: UsersService,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private subtasksService: SubtasksService
  ) {}

  ngOnInit() {
    // Get the logged-in user's ID from the login service
    const currentUserId = this.loginService.getCurrentUserId();
    this.userId = currentUserId ? currentUserId.toString() : '';

    this.route.paramMap.subscribe((params) => {
      // Use console.log to debug the URL and params

      // Try all possible param names
      let projectId: number | undefined;
      const possibleKeys = ['projectId', 'id', 'project'];
      for (const key of possibleKeys) {
        const val = params.get(key);
        if (val && !isNaN(Number(val))) {
          projectId = Number(val);
          break;
        }
      }

      // If no projectId found in params, try to extract it from URL
      if (!projectId) {
        const urlMatch = window.location.pathname.match(
          /\/project\/(\d+)\/resumen/
        );
        if (urlMatch && urlMatch[1]) {
          projectId = Number(urlMatch[1]);
        }
      }
      this.projectId = projectId ?? null;

      // Debug: log all route params

      if (!projectId) {
        console.error('No projectId found in route parameters');
        return;
      }

      // Fetch project details
      this.loading = true;
      this.projectsService
        .findOne(projectId)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.markForCheck(); // Mark component for change detection
          })
        )
        .subscribe({
          next: (project) => {
            this.projectName = project.nombre;
            this.projectCliente = project.creadoPorId || 0;
            this.projectProgreso = 25; // Placeholder
            this.projectTiempoEstimado = ''; // Placeholder
            this.projectDescripcion = project.descripcion || '';
            this.cdr.markForCheck(); // Mark component for change detection
          },
          error: (err) => {
            console.error('Error fetching project:', err);
            this.cdr.markForCheck();
          },
        });

      // Fetch all tasks for this project
      this.tasksService.findByProjectId(projectId).subscribe({
        next: (tasks) => {
          this.allTasks = tasks;
          // Sort by fechaVencimiento ascending, filter out completed
          this.tareasProximas = tasks
            .filter((t) => !t.completada)
            .sort((a, b) => {
              const aDate = a.fechaVencimiento
                ? new Date(a.fechaVencimiento).getTime()
                : Infinity;
              const bDate = b.fechaVencimiento
                ? new Date(b.fechaVencimiento).getTime()
                : Infinity;
              return aDate - bDate;
            })
            .slice(0, 3); // Show next 3 upcoming tasks

          // Set miembros as the unique creators of the tasks
          const uniqueCreators = Array.from(
            new Set(tasks.map((t) => t.creadoPorId))
          );
          this.projectMiembros = uniqueCreators;

          // Fetch user names for each unique creator
          this.miembroNombres = {};
          let pendingRequests = uniqueCreators.length;

          if (pendingRequests === 0) {
            this.cdr.markForCheck();
          } else {
            uniqueCreators.forEach((userId) => {
              this.usersService.findOne(userId).subscribe({
                next: (user: User) => {
                  this.miembroNombres[userId] =
                    user.nombre || user.correoElectronico;
                  pendingRequests--;
                  if (pendingRequests === 0) {
                    this.cdr.markForCheck();
                  }
                },
                error: (err) => {
                  console.error(`Error fetching user ${userId}:`, err);
                  pendingRequests--;
                  if (pendingRequests === 0) {
                    this.cdr.markForCheck();
                  }
                },
              });
            });
          }

          // Fetch all subtasks for these tasks
          const taskIds = tasks.map((t) => t.id);
          let loaded = 0;
          const subtasksMap: { [taskId: number]: Subtask[] } = {};
          if (taskIds.length === 0) {
            this.subtasksByTaskId.set(subtasksMap);
          } else {
            taskIds.forEach((taskId) => {
              this.subtasksService.findByTaskId(taskId).subscribe({
                next: (subtasks: Subtask[]) => {
                  subtasksMap[taskId] = subtasks;
                  loaded++;
                  if (loaded === taskIds.length) {
                    this.subtasksByTaskId.set(subtasksMap);
                    this.cdr.markForCheck();
                  }
                },
                error: () => {
                  loaded++;
                  if (loaded === taskIds.length) {
                    this.subtasksByTaskId.set(subtasksMap);
                    this.cdr.markForCheck();
                  }
                },
              });
            });
          }

          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error fetching tasks:', err);
          this.cdr.markForCheck();
        },
      });
    });
  }

  daysLeft(date: string | Date): number {
    const now = new Date();
    const due = new Date(date);
    const diff = due.getTime() - now.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  }

  getSubtaskProgressSignal(taskId: number) {
    return computed(() => {
      const subtasks = this.subtasksByTaskId()[taskId] || [];
      if (subtasks.length === 0) return null;
      const completed = subtasks.filter((s) => s.completada).length;
      return Math.round((completed / subtasks.length) * 100);
    });
  }
}
