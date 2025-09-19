import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecoverPasswordService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  updatePasswordByEmail(
    email: string,
    dto: UpdatePasswordDto
  ): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/by-email/${encodeURIComponent(email)}/password`,
      dto
    );
  }

  updatePassword(id: number, dto: UpdatePasswordDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/password`, dto);
  }

  getHashedPassword(id: number): Observable<{ hashedPassword: string }> {
    return this.http.get<{ hashedPassword: string }>(
      `${this.apiUrl}/${id}/hashed-password`
    );
  }
}
