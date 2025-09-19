import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Email, CreateEmailDto, UpdateEmailDto } from '../model/email.model';
import { LoginService } from '../../auth/services/login.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmailsService {
  private readonly apiUrl = `${environment.apiUrl}/emails`;

  constructor(private http: HttpClient, private loginService: LoginService) {}

  create(dto: CreateEmailDto): Observable<Email> {
    // Automatically set current user as sender if not specified
    const userId = this.loginService.getCurrentUserId();
    if (userId && !dto.remitenteId) {
      dto.remitenteId = userId;
    }
    return this.http.post<Email>(this.apiUrl, dto);
  }

  findAll(): Observable<Email[]> {
    return this.http.get<Email[]>(this.apiUrl);
  }

  findOne(id: number): Observable<Email> {
    return this.http.get<Email>(`${this.apiUrl}/${id}`);
  }

  update(id: number, dto: UpdateEmailDto): Observable<Email> {
    return this.http.patch<Email>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: number): Observable<Email> {
    return this.http.delete<Email>(`${this.apiUrl}/${id}`);
  }

  findBySenderId(senderId: number): Observable<Email[]> {
    return this.http.get<Email[]>(`${this.apiUrl}/sender/${senderId}`);
  }

  findByReceiverId(receiverId: number): Observable<Email[]> {
    return this.http.get<Email[]>(`${this.apiUrl}/receiver/${receiverId}`);
  }

  findMyEmails(): Observable<Email[]> {
    const userId = this.loginService.getCurrentUserId();
    if (userId) {
      return this.findByReceiverId(userId);
    }
    return this.findAll();
  }

  findMySentEmails(): Observable<Email[]> {
    const userId = this.loginService.getCurrentUserId();
    if (userId) {
      return this.findBySenderId(userId);
    }
    return this.findAll();
  }

  sendEmail(
    receiverId: number,
    subject: string,
    body: string
  ): Observable<Email> {
    const senderId = this.loginService.getCurrentUserId();
    if (!senderId) {
      throw new Error('No user is currently logged in');
    }

    const dto: CreateEmailDto = {
      destinatarioId: receiverId,
      remitenteId: senderId,
      asunto: subject,
      cuerpo: body,
    };

    return this.create(dto);
  }
}
