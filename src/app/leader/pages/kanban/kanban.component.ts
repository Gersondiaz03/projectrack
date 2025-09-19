import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';

import {
  TasksService,
  Task,
  EstadoTarea,
} from '../../../core/services/tasks.service';
import { ProjectsService } from '../../../core/services/projects.service';
import { LoginService } from '../../../auth/services/login.service';
import { User } from '../../../core/model/user.model';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule, ScrollingModule, RouterLink],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanComponent implements OnInit {
  // ─────────────────────────  columnas ──────────────────────────
  columns = [
    { key: EstadoTarea.POR_HACER, label: 'Por Hacer', color: 'purple' },
    { key: EstadoTarea.EN_PROGRESO, label: 'En Progreso', color: 'yellow' },
    { key: EstadoTarea.COMPLETADA, label: 'Completada', color: 'green' },
    { key: EstadoTarea.BLOQUEADA, label: 'Bloqueada', color: 'red' },
  ];
  dropListIds = this.columns.map((_, i) => `dropList${i}`);

  // ─────────────────────────  estado local ──────────────────────
  tasksByEstado: { [key in EstadoTarea]: Task[] } = {
    [EstadoTarea.POR_HACER]: [],
    [EstadoTarea.EN_PROGRESO]: [],
    [EstadoTarea.COMPLETADA]: [],
    [EstadoTarea.BLOQUEADA]: [],
  };
  loading = true;
  projectId: number | null = null;
  projectName = '';

  // ─────────────────────────  dependencias ──────────────────────
  private tasksService = inject(TasksService);
  private projectsService = inject(ProjectsService);
  private loginService = inject(LoginService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentUser: User | null = this.loginService.getCurrentUser();
  currentUserId: number | null = this.currentUser?.id ?? null;

  // ─────────────────────────  helpers ───────────────────────────
  getConnectedDropLists(idxActual: number) {
    return this.dropListIds.filter((_, idx) => idx !== idxActual);
  }

  // ─────────────────────────  ciclo de vida ─────────────────────
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const p = params.get('projectId');
      this.projectId = p ? +p : null;

      if (!this.projectId) return;

      this.projectsService.findOne(this.projectId).subscribe((proj) => {
        this.projectName = proj.nombre;
        this.cdr.markForCheck();
      });

      this.tasksService.findByProjectId(this.projectId).subscribe((tasks) => {
        // Mostrar todas las tareas del proyecto, no solo las creadas por el usuario actual
        for (const est of Object.values(EstadoTarea))
          this.tasksByEstado[est] = tasks.filter((t) => t.estado === est);

        this.loading = false;
        this.cdr.detectChanges();
      });
    });
  }

  // ─────────────────────────  navegación ────────────────────────
  goToCreateTask() {
    if (this.projectId)
      this.router.navigate(['../create-task'], { relativeTo: this.route });
  }

  // ─────────────────────────  DnD principal ─────────────────────
  drop(event: CdkDragDrop<Task[]>, nuevoEstado: EstadoTarea) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.cdr.markForCheck(); // OnPush!
      return;
    }

    // ─── ① Movimiento optimista ────────────────────────────────
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    const movedTask = event.container.data[event.currentIndex];
    const estadoOriginal = movedTask.estado;
    movedTask.estado = nuevoEstado;
    this.cdr.markForCheck();

    // ─── ② Sincronizar con backend ─────────────────────────────
    this.tasksService
      .updateEstado(movedTask.id, { estado: nuevoEstado })
      .subscribe({
        next: () => console.log('PATCH OK'),
        error: (err) => {
          console.error('PATCH failed, reverting', err);

          // ─── ③ Revertir si falló ──────────────────────────────
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
          movedTask.estado = estadoOriginal;
          this.cdr.markForCheck();
        },
      });
  }

  // Factory para plantilla
  onDropFactory(estado: EstadoTarea) {
    return (event: CdkDragDrop<Task[]>) => this.drop(event, estado);
  }

  EstadoTarea = EstadoTarea;
}
