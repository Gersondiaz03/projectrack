import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  TasksService,
  Task,
  Prioridad,
} from '../../../core/services/tasks.service';
import { TimeTrackingService } from '../../../core/services/time-tracking.service';
import { ModalRegistrarTiempoComponent } from './modal-registrar-tiempo.component';
import { ModalAgregarSubtareaComponent } from './modal-agregar-subtarea.component';
import { SubtasksService } from '../../../core/services/subtasks.service';
import { TimeTracking } from '../../../core/model/time-tracking.model';
import { UsersService } from '../../../core/services/users.service';
import { Subtask } from '../../../core/model/subtask.model';
import { User } from '../../../core/model/user.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalAgregarSubtareaComponent,
    ModalRegistrarTiempoComponent,
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.css',
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  subtasks: Subtask[] = [];
  timeRecords: TimeTracking[] = [];
  users: { [id: number]: User } = {};
  loading = true;
  Prioridad = Prioridad;

  showPriorityMenu = false;
  newSubtaskTitle = '';
  newTimeStart = '';
  newTimeEnd = '';
  newTimeNotes = '';

  showAgregarSubtareaModal = false;
  showRegistrarTiempoModal = false;

  constructor(
    private route: ActivatedRoute,
    private tasksService: TasksService,
    private subtasksService: SubtasksService = inject(SubtasksService),
    private timeTrackingService: TimeTrackingService = inject(
      TimeTrackingService
    ),
    private usersService: UsersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const taskId = Number(params.get('taskId'));
      if (taskId) {
        this.fetchTask(taskId);
        this.fetchSubtasks(taskId);
        this.fetchTimeRecords(taskId);
      }
    });
  }

  fetchTask(taskId: number) {
    // Use projectId from route params
    const projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    if (projectId) {
      this.tasksService
        .findOneByProjectId(projectId, taskId)
        .subscribe((task) => {
          this.task = task;
          this.fetchUser(task.creadoPorId);
          this.cdr.markForCheck();
        });
    } else {
      // fallback to old method if no projectId
      this.tasksService.findOne(taskId).subscribe((task) => {
        this.task = task;
        this.fetchUser(task.creadoPorId);
        this.cdr.markForCheck();
      });
    }
  }

  fetchSubtasks(taskId: number) {
    this.subtasksService
      .findByTaskId(taskId)
      .subscribe((subtasks: Subtask[]) => {
        this.subtasks = subtasks;
        // Preload user cache for created/completed users
        for (const s of this.subtasks) {
          if (s.creadoPorId) this.fetchUser(s.creadoPorId);
          if (s.completadaPorId) this.fetchUser(s.completadaPorId);
        }
        this.cdr.markForCheck();
      });
  }

  fetchTimeRecords(taskId: number) {
    this.timeTrackingService
      .findByTaskId(taskId)
      .subscribe((records: TimeTracking[]) => {
        this.timeRecords = records;
        for (const r of this.timeRecords) {
          if ((r as any).usuarioId) this.fetchUser((r as any).usuarioId);
        }
        this.cdr.markForCheck();
      });
  }

  fetchUser(userId: number) {
    if (!this.users[userId]) {
      this.usersService.findOne(userId).subscribe((user) => {
        this.users[userId] = user;
        this.cdr.markForCheck();
      });
    }
  }

  changePriority(priority: Prioridad) {
    if (this.task) {
      this.tasksService
        .updatePrioridad(this.task.id, { prioridad: priority })
        .subscribe((updated) => {
          this.task = { ...this.task!, prioridad: priority };
          this.cdr.markForCheck();
        });
    }
  }

  toggleSubtaskCompletion(subtask: Subtask) {
    if (this.task) {
      const currentUserId = this.task.creadoPorId;
      this.subtasksService
        .updateForTask(this.task.id, subtask.id, {
          completada: !subtask.completada,
          completadaPorId: !subtask.completada ? currentUserId : undefined,
          fechaCompletada: !subtask.completada
            ? (new Date().toISOString() as any)
            : undefined,
        })
        .subscribe((updated: Subtask) => {
          subtask.completada = updated.completada;
          subtask.completadaPorId = updated.completadaPorId;
          subtask.fechaCompletada = updated.fechaCompletada as any;
          if (updated.completadaPorId) this.fetchUser(updated.completadaPorId);
          this.cdr.markForCheck();
        });
    }
  }

  addSubtask(title: string) {
    if (this.task) {
      this.subtasksService
        .createForTask(this.task.id, {
          titulo: title,
          taskId: this.task.id,
          creadoPorId: this.task.creadoPorId,
        })
        .subscribe((newSubtask: Subtask) => {
          this.subtasks.push(newSubtask);
          this.cdr.markForCheck();
        });
    }
  }

  addTimeRecord(start: Date, end: Date, notes?: string) {
    if (this.task) {
      const currentUserId = this.task.creadoPorId;
      this.timeTrackingService
        .create({
          taskId: this.task.id,
          usuarioId: currentUserId,
          tiempoInicio: start,
          tiempoFin: end,
          notas: notes,
        })
        .subscribe((newRecord: TimeTracking) => {
          this.timeRecords.push(newRecord);
          if ((newRecord as any).usuarioId)
            this.fetchUser((newRecord as any).usuarioId);
          this.cdr.markForCheck();
        });
    }
  }

  addTimeRecordFromInputs() {
    if (this.task && this.newTimeStart && this.newTimeEnd) {
      const today = new Date();
      const [startHour, startMin] = this.newTimeStart.split(':').map(Number);
      const [endHour, endMin] = this.newTimeEnd.split(':').map(Number);
      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        startHour,
        startMin
      );
      const end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        endHour,
        endMin
      );
      this.addTimeRecord(start, end, this.newTimeNotes);
      this.newTimeStart = '';
      this.newTimeEnd = '';
      this.newTimeNotes = '';
    }
  }

  onSubtareaAgregada(subtask: Subtask) {
    this.subtasks.push(subtask);
    this.showAgregarSubtareaModal = false;
    this.cdr.markForCheck();
  }

  onTiempoRegistrado(event: { start: string; end: string; notes: string }) {
    if (this.task) {
      const today = new Date();
      const [startHour, startMin] = event.start.split(':').map(Number);
      const [endHour, endMin] = event.end.split(':').map(Number);
      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        startHour,
        startMin
      );
      const end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        endHour,
        endMin
      );
      this.addTimeRecord(start, end, event.notes);
    }
    this.showRegistrarTiempoModal = false;
  }
}
