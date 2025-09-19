import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SubtaskAssignmentsService } from '../../../core/services/subtask-assignments.service';
import { NotificationsService } from '../../../core/services/notifications.service';
import { SubtasksService } from '../../../core/services/subtasks.service';
import { ProjectsService } from '../../../core/services/projects.service';
import { UsersService } from '../../../core/services/users.service';
import { TasksService } from '../../../core/services/tasks.service';
import { LoginService } from '../../../auth/services/login.service';
import { Subtask } from '../../../core/model/subtask.model';

@Component({
  selector: 'app-modal-agregar-subtarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close()"></div>
    <div class="modal-content">
      <h3>Agregar subtarea</h3>
      <input
        type="text"
        [(ngModel)]="titulo"
        placeholder="Título de la subtarea"
        class="mb-2"
      />
      <textarea
        [(ngModel)]="texto"
        placeholder="Descripción (opcional)"
        rows="3"
        class="mb-2"
      ></textarea>
      <div class="modal-actions">
        <button (click)="add()" [disabled]="!titulo.trim() || loading">
          {{ loading ? 'Agregando...' : 'Agregar' }}
        </button>
        <button (click)="close()">Cancelar</button>
      </div>
      <div *ngIf="error" class="error">{{ error }}</div>
      <div *ngIf="debug" class="debug">taskId: {{ taskId }}</div>
    </div>
  `,
  styleUrls: ['./modal-agregar-subtarea.component.css'],
})
export class ModalAgregarSubtareaComponent {
  @Input() taskId!: number;
  @Output() subtareaAgregada = new EventEmitter<
    Subtask & { _assignment?: any }
  >();
  @Output() cerrar = new EventEmitter<void>();
  titulo = '';
  texto = '';
  loading = false;
  error: string | null = null;
  debug = true; // Enable debugging

  constructor(
    private subtasksService: SubtasksService,
    private subtaskAssignmentsService: SubtaskAssignmentsService,
    private loginService: LoginService,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
    private tasksService: TasksService,
    private projectsService: ProjectsService
  ) {}

  add() {
    if (this.titulo.trim() && this.taskId) {
      this.loading = true;
      this.error = null;
      const createDto = {
        taskId: this.taskId,
        titulo: this.titulo.trim(),
        texto: this.texto.trim(),
        completada: false,
        creadoPorId: this.loginService.getCurrentUserId() || undefined,
      };
      this.subtasksService.createForTask(this.taskId, createDto).subscribe({
        next: (subtask: Subtask) => {
          this.notifyMembers(subtask);
          this.assignToCurrentUser(subtask);
        },
        error: (err: any) => {
          if (err.status === 400) {
            this.error = 'Error 400 - Reintentando con payload mínimo...';
            this.subtasksService
              .createForTaskMinimal(this.taskId, this.titulo.trim())
              .subscribe({
                next: (subtask: Subtask) => {
                  this.notifyMembers(subtask);
                  this.assignToCurrentUser(subtask);
                },
                error: (fallbackErr: any) => {
                  this.error = `Error al agregar subtarea: ${err.status} ${err.statusText}. Reintento fallido.`;
                  this.loading = false;
                },
              });
          } else {
            this.error = `Error al agregar subtarea: ${err.status} ${err.statusText}`;
            this.loading = false;
          }
        },
      });
    }
  }

  private notifyMembers(subtask: Subtask) {
    // Get task, project, and members for notification
    this.tasksService.findOne(subtask.taskId).subscribe((task) => {
      this.projectsService.findOne(task.projectId).subscribe((project) => {
        this.usersService.findByProjectId(project.id).subscribe((users) => {
          const creador = this.loginService.getCurrentUser();
          const creadorNombre =
            creador?.nombre || creador?.correoElectronico || 'Alguien';
          const nombreTarea = task.nombre;
          const nombreProyecto = project.nombre;
          const timestamp = new Date().toLocaleString('es-CO', {
            dateStyle: 'medium',
            timeStyle: 'short',
          });
          users.forEach((user) => {
            if (user.id !== creador?.id) {
              this.notificationsService
                .create({
                  userId: user.id,
                  mensaje: `${creadorNombre} agregó una nueva subtarea a la tarea ${nombreTarea} del proyecto ${nombreProyecto} el ${timestamp}.`,
                  tipo: 'subtarea',
                  leida: false,
                })
                .subscribe();
            }
          });
        });
      });
    });
  }

  private assignToCurrentUser(subtask: Subtask) {
    const userId = this.loginService.getCurrentUserId();
    if (userId) {
      this.subtaskAssignmentsService
        .create({
          subtaskId: subtask.id,
          usuarioId: userId,
        })
        .subscribe({
          next: (assignment: any) => {
            this.subtareaAgregada.emit({ ...subtask, _assignment: assignment });
            this.titulo = '';
            this.texto = '';
            this.loading = false;
            this.close();
          },
          error: (_err: any) => {
            this.error = 'Subtarea creada pero no se pudo asignar al usuario.';
            this.subtareaAgregada.emit(subtask);
            this.titulo = '';
            this.texto = '';
            this.loading = false;
            this.close();
          },
        });
    } else {
      this.subtareaAgregada.emit(subtask);
      this.titulo = '';
      this.texto = '';
      this.loading = false;
      this.close();
    }
  }

  close() {
    this.cerrar.emit();
  }
}
