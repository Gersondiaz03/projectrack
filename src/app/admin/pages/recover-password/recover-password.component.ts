import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';

import { RecoverPasswordService } from '../../../auth/recover-password/recover-password.service';
import { LoginService } from '../../../auth/services/login.service';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.css',
})
export class RecoverPasswordComponent {
  newPassword: string = '';
  currentPassword: string = '';
  error: string | null = null;
  success: boolean = false;

  constructor(
    private recoverPasswordService: RecoverPasswordService,
    private loginService: LoginService
  ) {}

  changePassword() {
    this.error = null;
    this.success = false;
    const userId = this.loginService.getCurrentUserId();
    if (!userId) {
      this.error = 'No user is currently logged in.';
      return;
    }
    if (!this.currentPassword) {
      this.error = 'La contraseña actual es obligatoria.';
      return;
    }
    if (!this.newPassword || this.newPassword.length < 6) {
      this.error = 'La nueva contraseña debe tener al menos 6 caracteres.';
      return;
    }
    this.recoverPasswordService
      .updatePassword(userId, {
        newPassword: this.newPassword,
        currentPassword: this.currentPassword,
      })
      .subscribe({
        next: () => {
          this.success = true;
          this.error = null;
          this.newPassword = '';
          this.currentPassword = '';
        },
        error: (err: any) => {
          this.error = 'Error al cambiar la contraseña.';
          this.success = false;
        },
      });
  }
}
