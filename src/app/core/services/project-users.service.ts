import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ProjectUser,
  CreateProjectUserDto,
  UpdateProjectUserDto,
} from '../model/project-user.model';
import { LoginService } from '../../auth/services/login.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectUsersService {
  private readonly apiUrl = `${environment.apiUrl}/project-users`;

  constructor(private http: HttpClient, private loginService: LoginService) {}

  create(dto: CreateProjectUserDto): Observable<ProjectUser> {
    // Use the correct backend endpoint for assigning a user to a project
    return this.http.post<ProjectUser>(
      `${environment.apiUrl}/projects/assign-user`,
      dto
    );
  }

  findAll(): Observable<ProjectUser[]> {
    return this.http.get<ProjectUser[]>(this.apiUrl);
  }

  findOne(id: number): Observable<ProjectUser> {
    return this.http.get<ProjectUser>(`${this.apiUrl}/${id}`);
  }

  update(id: number, dto: UpdateProjectUserDto): Observable<ProjectUser> {
    return this.http.patch<ProjectUser>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: number): Observable<ProjectUser> {
    return this.http.delete<ProjectUser>(`${this.apiUrl}/${id}`);
  }

  findByProjectId(projectId: number): Observable<ProjectUser[]> {
    return this.http.get<ProjectUser[]>(`${this.apiUrl}/project/${projectId}`);
  }

  findByUserId(userId: number): Observable<ProjectUser[]> {
    // Use the correct backend endpoint
    return this.http.get<ProjectUser[]>(
      `${environment.apiUrl}/projects/user/${userId}`
    );
  }

  findMyProjects(): Observable<ProjectUser[]> {
    const userId = this.loginService.getCurrentUserId();
    if (userId) {
      return this.findByUserId(userId);
    }
    return this.findAll();
  }
}
