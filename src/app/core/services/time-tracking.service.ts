import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import {
  TimeTracking,
  CreateTimeTrackingDto,
  UpdateTimeTrackingDto,
} from '../model/time-tracking.model';
import { LoginService } from '../../auth/services/login.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TimeTrackingService {
  private readonly apiUrl = `${environment.apiUrl}/time-register`;

  constructor(private http: HttpClient, private loginService: LoginService) {}

  create(dto: CreateTimeTrackingDto): Observable<TimeTracking> {
    // Map frontend fields to backend fields
    const userId = this.loginService.getCurrentUserId();
    const payload: any = {
      ...dto,
      userId: dto.usuarioId || userId,
      taskId: dto.taskId,
      tiempoInicio: dto.tiempoInicio,
      tiempoFin: dto.tiempoFin,
      notas: dto.notas,
    };
    delete payload.usuarioId;
    delete payload.taskId;
    return this.http
      .post<TimeTracking>(this.apiUrl, payload)
      .pipe(map((r: any) => this.mapBackendToFrontend(r)));
  }

  findAll(): Observable<TimeTracking[]> {
    return this.http
      .get<TimeTracking[]>(this.apiUrl)
      .pipe(map((arr: any[]) => arr.map((r) => this.mapBackendToFrontend(r))));
  }

  findOne(id: number): Observable<TimeTracking> {
    return this.http
      .get<TimeTracking>(`${this.apiUrl}/${id}`)
      .pipe(map((r: any) => this.mapBackendToFrontend(r)));
  }

  update(id: number, dto: UpdateTimeTrackingDto): Observable<TimeTracking> {
    return this.http
      .patch<TimeTracking>(`${this.apiUrl}/${id}`, dto)
      .pipe(map((r: any) => this.mapBackendToFrontend(r)));
  }

  remove(id: number): Observable<TimeTracking> {
    return this.http.delete<TimeTracking>(`${this.apiUrl}/${id}`);
  }

  // Backend endpoint exists: GET /time-register/task/:taskId
  findByTaskId(taskId: number): Observable<TimeTracking[]> {
    return this.http
      .get<TimeTracking[]>(`${this.apiUrl}/task/${taskId}`)
      .pipe(map((arr: any[]) => arr.map((r) => this.mapBackendToFrontend(r))));
  }

  findByUserId(userId: number): Observable<TimeTracking[]> {
    return this.findAll().pipe(
      map((records) => records.filter((r) => r.usuarioId === userId))
    );
  }

  findMyTracking(): Observable<TimeTracking[]> {
    const userId = this.loginService.getCurrentUserId();
    if (userId) {
      return this.findByUserId(userId);
    }
    return this.findAll();
  }

  startTracking(taskId: number, notes?: string): Observable<TimeTracking> {
    const dto: CreateTimeTrackingDto = {
      taskId: taskId,
      usuarioId: this.loginService.getCurrentUserId() || 0,
      tiempoInicio: new Date(),
      notas: notes,
    };
    return this.create(dto);
  }

  stopTracking(id: number): Observable<TimeTracking> {
    const dto: UpdateTimeTrackingDto = {
      tiempoFin: new Date(),
    };
    return this.update(id, dto);
  }

  private mapBackendToFrontend(r: any): TimeTracking {
    const mapped: any = {
      ...r,
      usuarioId: r.usuarioId ?? r.userId ?? r.user?.id,
      usuario: r.usuario ?? r.user,
      tarea: r.tarea ?? r.task,
    };
    return mapped as TimeTracking;
  }
}
