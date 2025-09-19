import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateUserDto, UsersService } from '../../core/services/users.service';
import { User } from '../../core/model/user.model';

@Component({
  selector: 'app-modal-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-backdrop" (click)="close()"></div>
    <div class="modal-content text-black">
      <h3>Crear usuario</h3>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <input
          formControlName="nombreUsuario"
          placeholder="Usuario (3-50 carácteres)"
          class="mb-2"
        />
        <input
          formControlName="primerNombre"
          placeholder="Primer nombre"
          class="mb-2"
        />
        <input
          formControlName="segundoNombre"
          placeholder="Segundo nombre (opcional)"
          class="mb-2"
        />
        <input
          formControlName="primerApellido"
          placeholder="Primer apellido"
          class="mb-2"
        />
        <input
          formControlName="segundoApellido"
          placeholder="Segundo apellido"
          class="mb-2"
        />
        <input
          formControlName="posicion"
          placeholder="Posición (opcional)"
          class="mb-2"
        />
        <input
          formControlName="correoElectronico"
          placeholder="Correo electrónico"
          class="mb-2"
        />
        <input
          type="password"
          formControlName="contrasena"
          placeholder="Contraseña"
          class="mb-2"
        />
        <select formControlName="rol" class="mb-4">
          <option value="" disabled>Seleccione un rol</option>
          <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
        </select>
        <div class="actions">
          <button type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Creando...' : 'Crear' }}
          </button>
          <button type="button" (click)="close()">Cancelar</button>
        </div>
      </form>
      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
  styleUrls: ['./modal-create-user.component.css'],
})
export class ModalCreateUserComponent {
  @Output() userCreated = new EventEmitter<User>();
  @Output() closeModal = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  error: string | null = null;

  roles = ['Líder de Proyecto', 'Empleado', 'Cliente'];

  constructor(private fb: FormBuilder, private usersService: UsersService) {
    this.form = this.fb.group({
      nombreUsuario: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      primerNombre: ['', Validators.required],
      segundoNombre: [''],
      primerApellido: ['', Validators.required],
      segundoApellido: ['', Validators.required],
      posicion: [''],
      correoElectronico: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
      rol: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    const dto: CreateUserDto = this.form.value;
    this.usersService.create(dto).subscribe({
      next: (user: User) => {
        this.userCreated.emit(user);
        this.reset();
        this.close();
      },
      error: (err: any) => {
        this.error = 'Error al crear usuario';
        this.loading = false;
      },
    });
  }

  close() {
    this.closeModal.emit();
  }

  private reset() {
    this.form.reset({
      nombreUsuario: '',
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      posicion: '',
      correoElectronico: '',
      contrasena: '',
      rol: '',
    });
    this.loading = false;
    this.error = null;
  }
}
