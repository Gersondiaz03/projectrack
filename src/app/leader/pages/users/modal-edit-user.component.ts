import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RolProyecto } from '../../../core/model/project-user.model';
import { User } from '../../../core/model/user.model';

@Component({
  selector: 'app-modal-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-backdrop" (click)="close()"></div>
    <div class="modal-content">
      <h3>Editar usuario del proyecto</h3>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="mb-2">
          <label>Nombre</label>
          <input formControlName="nombre" type="text" />
        </div>
        <div class="mb-2">
          <label>Correo electrónico</label>
          <input formControlName="correoElectronico" type="email" />
        </div>
        <div class="mb-4">
          <label>Rol en proyecto</label>
          <select formControlName="rolEnProyecto">
            <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
          </select>
        </div>
        <div class="actions">
          <button type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Guardando...' : 'Guardar' }}
          </button>
          <button type="button" (click)="close()">Cancelar</button>
        </div>
      </form>
      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
  styleUrls: ['./modal-edit-user.component.css'],
})
export class ModalEditUserComponent {
  @Input() user: User | null = null;
  @Input() loading = false;
  @Output() save = new EventEmitter<any>();
  @Output() closeModal = new EventEmitter<void>();

  form: FormGroup;
  error: string | null = null;
  roles = [RolProyecto.LIDER, RolProyecto.EMPLEADO, RolProyecto.CLIENTE];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      correoElectronico: ['', [Validators.required, Validators.email]],
      rolEnProyecto: ['', Validators.required],
    });
  }

  ngOnChanges() {
    if (this.user) {
      this.form.patchValue({
        nombre: this.user.nombre,
        correoElectronico: this.user.correoElectronico,
        rolEnProyecto: this.user.rol,
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.save.emit({ ...this.form.value, id: this.user?.id });
  }

  close() {
    this.closeModal.emit();
  }
}
