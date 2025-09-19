import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalCreateUserComponent } from './modal-create-user.component';
import { UsersService } from '../../core/services/users.service';
import { User } from '../../core/model/user.model';

@Component({
  selector: 'app-all-users',
  standalone: true,
  imports: [CommonModule, ModalCreateUserComponent],
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllUsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error: string | null = null;
  showCreateModal = false;

  private usersService = inject(UsersService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading = true;
    this.usersService.findAll().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Error al cargar usuarios';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  deleteUser(user: User) {
    if (user.rol === 'Administrador') return;
    if (!confirm(`¿Eliminar usuario ${user.nombre || user.correoElectronico}?`))
      return;
    this.usersService.remove(user.id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== user.id);
        this.cdr.markForCheck();
      },
      error: () => {
        alert('No se pudo eliminar el usuario');
      },
    });
  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  handleUserCreated(user: User) {
    // Add new user to the top of the list
    this.users = [user, ...this.users];
    this.closeModal();
    this.cdr.markForCheck();
  }

  closeModal() {
    this.showCreateModal = false;
  }
}
