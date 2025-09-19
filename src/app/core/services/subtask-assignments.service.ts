import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  SubtaskAssignment,
  CreateSubtaskAssignmentDto,
  UpdateSubtaskAssignmentDto,
} from '../model/subtask-assignment.model';
import { LoginService } from '../../auth/services/login.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SubtaskAssignmentsService {
  private readonly apiUrl = `${environment.apiUrl}/subtasks`;

  constructor(private http: HttpClient, private loginService: LoginService) {}

  create(dto: CreateSubtaskAssignmentDto): Observable<SubtaskAssignment> {
    return this.http.post<SubtaskAssignment>(
      `${this.apiUrl}/${dto.subtaskId}/assignments`,
      {
        userId: dto.usuarioId,
      }
    );
  }

  findAll(): Observable<SubtaskAssignment[]> {
    // Not supported; return empty observable in absence of a global endpoint
    return this.http.get<SubtaskAssignment[]>(
      `${environment.apiUrl}/not-implemented`
    );
  }

  findOne(id: number): Observable<SubtaskAssignment> {
    return this.http.get<SubtaskAssignment>(
      `${environment.apiUrl}/not-implemented/${id}`
    );
  }

  update(
    id: number,
    dto: UpdateSubtaskAssignmentDto
  ): Observable<SubtaskAssignment> {
    return this.http.patch<SubtaskAssignment>(
      `${environment.apiUrl}/not-implemented/${id}`,
      dto
    );
  }

  remove(id: number): Observable<SubtaskAssignment> {
    return this.http.delete<SubtaskAssignment>(
      `${environment.apiUrl}/not-implemented/${id}`
    );
  }

  findBySubtaskId(subtaskId: number): Observable<SubtaskAssignment[]> {
    return this.http.get<SubtaskAssignment[]>(
      `${this.apiUrl}/${subtaskId}/assignments`
    );
  }

  findByUserId(userId: number): Observable<SubtaskAssignment[]> {
    return this.http.get<SubtaskAssignment[]>(
      `${environment.apiUrl}/not-implemented/user/${userId}`
    );
  }

  findMySubtaskAssignments(): Observable<SubtaskAssignment[]> {
    const userId = this.loginService.getCurrentUserId();
    if (userId) {
      return this.findByUserId(userId);
    }
    return this.findAll();
  }
}
