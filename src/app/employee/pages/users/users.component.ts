import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ProjectsService } from '../../../core/services/projects.service';
import { UsersService } from '../../../core/services/users.service';
import { Project } from '../../../core/model/project.model';
import { User } from '../../../core/model/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  projectId: number | null = null;
  projectName: string = '';

  private usersService = inject(UsersService);
  private projectsService = inject(ProjectsService);
  private route = inject(ActivatedRoute);
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
}
