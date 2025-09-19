import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ModalDeleteProjectComponent } from './modal-delete-project.component';
import { ProjectsService } from '../../core/services/projects.service';
import { LoginService } from '../../auth/services/login.service';
import { Project } from '../../core/model/project.model';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css',
  imports: [CommonModule, RouterLink, ModalDeleteProjectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  showDeleteModal = false;
  projectToDelete: Project | null = null;
  deleteError: string | null = null;

  constructor(
    private projectsService: ProjectsService,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const loadProjects = () => {
      this.projectsService.findAll().subscribe({
        next: (projects) => {
          this.projects = projects;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.projects = [];
          this.loading = false;
          this.cdr.markForCheck();
          console.error('Error loading projects:', err);
        },
      });
    };
    loadProjects();
    this.projectsService.projectsChanged$.subscribe(() => {
      loadProjects();
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  }

  openDeleteModal(project: Project) {
    this.projectToDelete = project;
    this.deleteError = null;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.projectToDelete = null;
    this.deleteError = null;
  }

  confirmDeleteProject() {
    if (!this.projectToDelete) return;
    this.deleteError = null;
    this.projectsService.remove(this.projectToDelete.id).subscribe({
      next: () => {
        this.projects = this.projects.filter(
          (p) => p.id !== this.projectToDelete?.id
        );
        this.closeDeleteModal();
        this.cdr.markForCheck();
      },
      error: () => {
        this.deleteError = 'No se pudo eliminar el proyecto.';
        this.cdr.markForCheck();
      },
    });
  }
}
