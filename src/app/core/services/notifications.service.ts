import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Notification,
  CreateNotificationDto,
  UpdateNotificationDto,
} from '../model/notification.model';
import { LoginService } from '../../auth/services/login.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient, private loginService: LoginService) {}

  create(dto: CreateNotificationDto): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, dto);
  }

  findAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  findOne(id: number): Observable<Notification> {
    return this.http.get<Notification>(`${this.apiUrl}/${id}`);
  }

  update(id: number, dto: UpdateNotificationDto): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: number): Observable<Notification> {
    return this.http.delete<Notification>(`${this.apiUrl}/${id}`);
  }

  findByUserId(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}`);
  }

  findMyNotifications(): Observable<Notification[]> {
    const userId = this.loginService.getCurrentUserId();
    if (userId) {
      return this.findByUserId(userId);
    }
    return this.findAll();
  }

  markAsRead(id: number): Observable<Notification> {
    return this.update(id, { leida: true });
  }

  markAllAsRead(): Observable<Notification[]> {
    const userId = this.loginService.getCurrentUserId();
    if (userId) {
      return this.http.post<Notification[]>(
        `${this.apiUrl}/read-all/${userId}`,
        {}
      );
    }
    throw new Error('No user is currently logged in');
  }
}
