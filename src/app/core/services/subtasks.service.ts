import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Subtask,
  CreateSubtaskDto,
  UpdateSubtaskDto,
} from '../model/subtask.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SubtasksService {
  private readonly apiUrl = `${environment.apiUrl}/subtasks`;

  constructor(private http: HttpClient) {}

  create(dto: CreateSubtaskDto): Observable<Subtask> {
    return this.http.post<Subtask>(this.apiUrl, dto);
  }

  findAll(): Observable<Subtask[]> {
    return this.http.get<Subtask[]>(this.apiUrl);
  }

  findOne(id: number): Observable<Subtask> {
    return this.http.get<Subtask>(`${this.apiUrl}/${id}`);
  }

  update(id: number, dto: UpdateSubtaskDto): Observable<Subtask> {
    return this.http.patch<Subtask>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: number): Observable<Subtask> {
    return this.http.delete<Subtask>(`${this.apiUrl}/${id}`);
  }

  findByTaskId(taskId: number): Observable<Subtask[]> {
    return this.http.get<Subtask[]>(`${this.apiUrl}/by-task/${taskId}`);
  }

  findByProjectId(projectId: number): Observable<Subtask[]> {
    return this.http.get<Subtask[]>(`${this.apiUrl}/by-project/${projectId}`);
  }
  createForTask(taskId: number, dto: CreateSubtaskDto): Observable<Subtask> {
    return this.http.post<Subtask>(`${this.apiUrl}/by-task/${taskId}`, dto);
  }

  updateForTask(
    taskId: number,
    id: number,
    dto: UpdateSubtaskDto
  ): Observable<Subtask> {
    return this.http.patch<Subtask>(
      `${this.apiUrl}/by-task/${taskId}/${id}`,
      dto
    );
  }

  updateForProject(
    projectId: number,
    id: number,
    dto: UpdateSubtaskDto
  ): Observable<Subtask> {
    return this.http.patch<Subtask>(
      `${this.apiUrl}/by-project/${projectId}/${id}`,
      dto
    );
  }

  /**
   * Test method for diagnosing subtask creation issues
   * Sends only the minimal required fields
   */
  createForTaskMinimal(taskId: number, titulo: string): Observable<Subtask> {
    const minimalDto = {
      taskId: taskId,
      titulo: titulo,
    };
    console.log(
      `Calling minimal API: POST ${this.apiUrl}/by-task/${taskId}`,
      minimalDto
    );
    return this.http.post<Subtask>(
      `${this.apiUrl}/by-task/${taskId}`,
      minimalDto
    );
  }

  toggleComplete(id: number, completed: boolean): Observable<Subtask> {
    return this.update(id, { completada: completed });
  }
}
