import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersExtraService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  findNotInProject(projectId: number): Observable<User[]> {
    return this.http.get<User[]>(
      `${environment.apiUrl}/projects/${projectId}/users-not-in-project`
    );
  }
}
