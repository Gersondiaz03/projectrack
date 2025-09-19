import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ProjectUsersService } from '../../core/services/project-users.service';
import { ProjectsService } from '../../core/services/projects.service';
import { LoginService } from '../../auth/services/login.service';
import { Project } from '../../core/model/project.model';

@Component({
  selector: 'app-main-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css',
})
export class MainPageComponent {
  projects: any[] = [];
  loading = true;

  constructor(
    private projectsService: ProjectsService,
    private projectUsersService: ProjectUsersService,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const loadProjects = () => {
      this.projectUsersService.findMyProjects().subscribe({
        next: (projects) => {
          // The backend returns Project[] directly
          this.projects = projects;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.projects = [];
          this.loading = false;
          this.cdr.markForCheck();
          console.error('Error loading user projects:', err);
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
}
