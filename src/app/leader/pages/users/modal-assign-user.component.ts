import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersExtraService } from '../../../core/services/users-extra.service';
import { RolProyecto } from '../../../core/model/project-user.model';
import { User } from '../../../core/model/user.model';


@Component({
  selector: 'app-modal-assign-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-backdrop" (click)="close()"></div>
    <div class="modal-content">
      <h3>Asignar usuario al proyecto</h3>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <select formControlName="usuarioId" class="mb-2">
          <option value="" disabled>Seleccione un usuario</option>
          <option *ngFor="let user of users" [value]="user.id">
            {{ user.nombre || user.correoElectronico }}
          </option>
        </select>
        <select formControlName="rolEnProyecto" class="mb-4">
          <option value="" disabled>Seleccione un rol</option>
          <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
        </select>
        <div class="actions">
          <button type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Asignando...' : 'Asignar' }}
          </button>
          <button type="button" (click)="close()">Cancelar</button>
        </div>
      </form>
      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
  styleUrls: ['./modal-assign-user.component.css'],
})
export class ModalAssignUserComponent implements OnInit {
  @Input() projectId: number | null = null;
  @Input() loading = false;
  @Output() assign = new EventEmitter<{
    usuarioId: number;
    rolEnProyecto: RolProyecto;
  }>();
  @Output() closeModal = new EventEmitter<void>();

  users: User[] = [];
  form: FormGroup;
  error: string | null = null;
  roles = [RolProyecto.LIDER, RolProyecto.EMPLEADO, RolProyecto.CLIENTE];

  constructor(
    private fb: FormBuilder,
    private usersExtraService: UsersExtraService
  ) {
    this.form = this.fb.group({
      usuarioId: ['', Validators.required],
      rolEnProyecto: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.projectId) {
      this.usersExtraService.findNotInProject(this.projectId).subscribe({
        next: (users: User[]) => {
          this.users = users;
        },
        error: () => {
          this.error = 'No se pudieron cargar los usuarios disponibles.';
        },
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const value = this.form.value;
    this.assign.emit({
      ...value,
      usuarioId: Number(value.usuarioId), // Ensure usuarioId is a number
    });
  }

  close() {
    this.closeModal.emit();
  }
}
