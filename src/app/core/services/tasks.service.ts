import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export enum EstadoTarea {
  POR_HACER = 'Por Hacer',
  EN_PROGRESO = 'En Progreso',
  COMPLETADA = 'Completada',
  BLOQUEADA = 'Bloqueada',
}

export enum Prioridad {
  ALTA = 'Alta',
  MEDIA = 'Media',
  BAJA = 'Baja',
}

export interface Task {
  id: number;
  projectId: number;
  project?: any;
  nombre: string;
  descripcion?: string;
  fechaInicio?: Date;
  fechaVencimiento?: Date;
  estado: EstadoTarea;
  prioridad: Prioridad;
  creadoPorId: number;
  creadoPor?: any;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  categoria?: string;
  solicitudRevision: boolean;
  calificacionRevision?: number;
  completada: boolean;
}

export interface CreateTaskDto {
  projectId: number;
  nombre: string;
  descripcion?: string;
  fechaInicio?: Date;
  fechaVencimiento?: Date;
  estado: EstadoTarea;
  prioridad: Prioridad;
  creadoPorId: number;
  categoria?: string;
  solicitudRevision?: boolean;
  calificacionRevision?: number;
  completada?: boolean;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  create(createTaskDto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, createTaskDto);
  }

  findAll(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  findOne(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  update(id: number, updateTaskDto: UpdateTaskDto): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, updateTaskDto);
  }

  remove(id: number): Observable<Task> {
    return this.http.delete<Task>(`${this.apiUrl}/${id}`);
  }

  findByProjectId(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/project/${projectId}`);
  }

  findByUserId(userId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Add a method to call the new backend endpoint for updating estado
  updateEstado(
    id: number,
    updateEstadoTareaDto: { estado: EstadoTarea }
  ): Observable<Task> {
    return this.http.patch<Task>(
      `${this.apiUrl}/${id}/estado`,
      updateEstadoTareaDto
    );
  }

  updatePrioridad(
    id: number,
    updatePrioridadTareaDto: { prioridad: Prioridad }
  ): Observable<Task> {
    return this.http.patch<Task>(
      `${this.apiUrl}/${id}/prioridad`,
      updatePrioridadTareaDto
    );
  }

  findOneByProjectId(projectId: number, id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/project/${projectId}/${id}`);
  }
}
