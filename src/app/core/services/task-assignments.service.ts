import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { TaskAssignment, CreateTaskAssignmentDto, UpdateTaskAssignmentDto, } from '../model/task-assignment.model';
import { LoginService } from '../../auth/services/login.service';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class TaskAssignmentsService {
  private readonly apiUrl = `${environment.apiUrl}/task-assignments`;

  constructor(private http: HttpClient, private loginService: LoginService) {}

  create(dto: CreateTaskAssignmentDto): Observable<TaskAssignment> {
    return this.http.post<TaskAssignment>(this.apiUrl, dto);
  }

  findAll(): Observable<TaskAssignment[]> {
    return this.http.get<TaskAssignment[]>(this.apiUrl);
  }

  findOne(id: number): Observable<TaskAssignment> {
    return this.http.get<TaskAssignment>(`${this.apiUrl}/${id}`);
  }

  update(id: number, dto: UpdateTaskAssignmentDto): Observable<TaskAssignment> {
    return this.http.patch<TaskAssignment>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: number): Observable<TaskAssignment> {
    return this.http.delete<TaskAssignment>(`${this.apiUrl}/${id}`);
  }

  findByTaskId(taskId: number): Observable<TaskAssignment[]> {
    return this.http.get<TaskAssignment[]>(`${this.apiUrl}/task/${taskId}`);
  }

  findByUserId(userId: number): Observable<TaskAssignment[]> {
    return this.http.get<TaskAssignment[]>(`${this.apiUrl}/user/${userId}`);
  }

  findAssignedTasks(): Observable<TaskAssignment[]> {
    const userId = this.loginService.getCurrentUserId();
    if (userId) {
      return this.findByUserId(userId);
    }
    return this.findAll();
  }
}
