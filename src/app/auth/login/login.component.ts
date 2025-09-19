import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true,
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      correoElectronico: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
    });
  }
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.loginService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        const userId = response.userId;
        const rol = response.rol;

        if (userId && rol) {
          let route = '';
          switch (rol) {
            case 'Administrador':
              route = '/admin/main';
              break;
            case 'Líder de Proyecto':
              route = '/leader/main';
              break;
            case 'Empleado':
              route = '/employee/main';
              break;
            case 'Cliente':
              route = '/client/main';
              break;
            default:
              route = `/${userId}/main`;
          }
          this.router.navigate([route]);
        }
      },
      error: (err) => {
        this.loading = false;

        if (
          err.message?.includes('Invalid token structure') ||
          err.message?.includes('Invalid token received')
        ) {
          alert(
            'Error de autenticación: El servidor devolvió una respuesta inválida. Por favor contacte al soporte técnico.'
          );
        } else {
          alert('Correo o contraseña incorrectos');
        }
      },
    });
  }
}
