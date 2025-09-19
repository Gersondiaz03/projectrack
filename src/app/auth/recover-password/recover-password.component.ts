import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import {
  RecoverPasswordService,
  UpdatePasswordDto,
} from './recover-password.service';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.css',
})
export class RecoverPasswordComponent {
  recoverForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private recoverService: RecoverPasswordService,
    private router: Router
  ) {
    this.recoverForm = this.fb.group({
      correoElectronico: ['', [Validators.required, Validators.email]],
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.recoverForm.invalid) {
      this.recoverForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { correoElectronico, currentPassword, newPassword } =
      this.recoverForm.value;
    const dto: UpdatePasswordDto = { currentPassword, newPassword };
    this.recoverService
      .updatePasswordByEmail(correoElectronico, dto)
      .subscribe({
        next: () => {
          this.loading = false;
          alert(
            'Contraseña actualizada exitosamente. Por favor inicia sesión.'
          );
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Error updating password:', err);
          alert('Ocurrió un error al actualizar la contraseña.');
        },
      });
  }
}
