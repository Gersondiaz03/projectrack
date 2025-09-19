import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  RolProyecto,
  CreateProjectUserDto,
} from '../../../core/model/project-user.model';
import { ProjectUsersService } from '../../../core/services/project-users.service';
import { UsersExtraService } from '../../../core/services/users-extra.service';
import { ProjectsService } from '../../../core/services/projects.service';
import { ModalAssignUserComponent } from './modal-assign-user.component';
import { ModalEditUserComponent } from './modal-edit-user.component';
import { UsersService } from '../../../core/services/users.service';
import { Project } from '../../../core/model/project.model';
import { User } from '../../../core/model/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ModalAssignUserComponent, ModalEditUserComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  projectId: number | null = null;
  projectName: string = '';

  showAssignModal = false;
  assignLoading = false;
  assignError: string | null = null;

  showEditModal = false;
  editLoading = false;
  editError: string | null = null;
  selectedUser: User | null = null;

  private usersService = inject(UsersService);
  private usersExtraService = inject(UsersExtraService);
  private projectUsersService = inject(ProjectUsersService);
  private projectsService = inject(ProjectsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const pid = params.get('projectId');
      this.projectId = pid ? +pid : null;
      if (this.projectId) {
        this.projectsService.findOne(this.projectId).subscribe({
          next: (project: Project) => {
            this.projectName = project.nombre;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error fetching project:', err);
            this.projectName = '';
            this.cdr.markForCheck();
          },
        });

        this.usersService.findByProjectId(this.projectId).subscribe({
          next: (users: any[]) => {
            this.users = users.map((u) => {
              // Fallback to available fields
              return {
                id: u.id,
                nombre: u.primerNombre || u.nombre || u.nombreUsuario || '',
                correoElectronico: u.correoElectronico || '',
                rol: u.rol || u.rolEnProyecto || '',
                createdAt: u.createdAt || u.fechaRegistro || '',
              };
            });
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error fetching users:', err);
            this.loading = false;
            this.cdr.markForCheck();
          },
        });
      }
    });
  }

  openAssignModal() {
    this.showAssignModal = true;
    this.assignLoading = false;
    this.cdr.markForCheck();
  }

  handleAssignUser(data: { usuarioId: number; rolEnProyecto: RolProyecto }) {
    if (!this.projectId) return;
    this.assignLoading = true;
    this.assignError = null;
    const dto: CreateProjectUserDto = {
      proyectoId: this.projectId,
      usuarioId: data.usuarioId,
      rolEnProyecto: data.rolEnProyecto,
    };
    this.projectUsersService.create(dto).subscribe({
      next: () => {
        this.showAssignModal = false;
        this.assignLoading = false;
        // Refresh users list
        this.usersService
          .findByProjectId(this.projectId!)
          .subscribe((users: any[]) => {
            this.users = users.map((u) => ({
              id: u.id,
              nombre: u.primerNombre || u.nombre || u.nombreUsuario || '',
              correoElectronico: u.correoElectronico || '',
              rol: u.rol || u.rolEnProyecto || '',
              createdAt: u.createdAt || u.fechaRegistro || '',
            }));
            this.cdr.markForCheck();
          });
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.assignError = 'No se pudo asignar el usuario.';
        this.assignLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  closeAssignModal() {
    this.showAssignModal = false;
    this.assignError = null;
  }

  openEditModal(user: User) {
    this.selectedUser = user;
    this.showEditModal = true;
    this.editLoading = false;
    this.editError = null;
    this.cdr.markForCheck();
  }

  handleEditUser(data: any) {
    if (!data.id) return;
    this.editLoading = true;
    this.editError = null;
    // Only update name, email, and role in project
    const updateDto = {
      nombre: data.nombre,
      correoElectronico: data.correoElectronico,
      rol: data.rolEnProyecto,
    };
    this.usersService.update(data.id, updateDto).subscribe({
      next: () => {
        this.showEditModal = false;
        this.editLoading = false;
        // Refresh users list
        if (this.projectId) {
          this.usersService
            .findByProjectId(this.projectId)
            .subscribe((users: any[]) => {
              this.users = users.map((u) => ({
                id: u.id,
                nombre: u.primerNombre || u.nombre || u.nombreUsuario || '',
                correoElectronico: u.correoElectronico || '',
                rol: u.rol || u.rolEnProyecto || '',
                createdAt: u.createdAt || u.fechaRegistro || '',
              }));
              this.cdr.markForCheck();
            });
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.editError = 'No se pudo editar el usuario.';
        this.editLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editError = null;
    this.selectedUser = null;
    this.cdr.markForCheck();
  }

  contactUser(user: User) {
    // Navigate to send-email route for the selected user
    this.router.navigate([`/admin/send-email/${user.id}`]);
  }
}
