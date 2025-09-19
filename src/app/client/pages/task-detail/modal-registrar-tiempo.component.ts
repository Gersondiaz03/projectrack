import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NotificationsService } from '../../../core/services/notifications.service';
import { ProjectsService } from '../../../core/services/projects.service';
import { UsersService } from '../../../core/services/users.service';
import { TasksService } from '../../../core/services/tasks.service';
import { LoginService } from '../../../auth/services/login.service';

@Component({
  selector: 'app-modal-registrar-tiempo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close()"></div>
    <div class="modal-content">
      <h3>Registrar tiempo</h3>
      <input type="time" [(ngModel)]="start" placeholder="Desde" />
      <input type="time" [(ngModel)]="end" placeholder="Hasta" />
      <input type="text" [(ngModel)]="notes" placeholder="Notas" />
      <div class="modal-actions">
        <button (click)="register()" [disabled]="!start || !end">
          Registrar
        </button>
        <button (click)="close()">Cancelar</button>
      </div>
    </div>
  `,
  styleUrls: ['./modal-registrar-tiempo.component.css'],
})
export class ModalRegistrarTiempoComponent {
  @Input() taskId!: number;
  @Output() tiempoRegistrado = new EventEmitter<{
    start: string;
    end: string;
    notes: string;
  }>();
  @Output() cerrar = new EventEmitter<void>();
  start = '';
  end = '';
  notes = '';

  constructor(
    private notificationsService: NotificationsService,
    private usersService: UsersService,
    private tasksService: TasksService,
    private projectsService: ProjectsService,
    private loginService: LoginService
  ) {}

  register() {
    if (this.start && this.end) {
      this.tiempoRegistrado.emit({
        start: this.start,
        end: this.end,
        notes: this.notes,
      });
      this.sendNotification();
      this.start = '';
      this.end = '';
      this.notes = '';
    }
  }

  private sendNotification() {
    if (!this.taskId) return;
    this.tasksService.findOne(this.taskId).subscribe((task) => {
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
                  mensaje: `${creadorNombre} registró tiempo en la tarea ${nombreTarea} del proyecto ${nombreProyecto} el ${timestamp}.`,
                  tipo: 'tiempo',
                  leida: false,
                })
                .subscribe();
            }
          });
        });
      });
    });
  }

  close() {
    this.cerrar.emit();
  }
}
