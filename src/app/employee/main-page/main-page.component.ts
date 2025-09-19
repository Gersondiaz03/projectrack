import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ProjectsService } from '../../core/services/projects.service';
import { LoginService } from '../../auth/services/login.service';
import { Project } from '../../core/model/project.model';


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css',
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent implements OnInit {
  projects: Project[] = [];
  loading = true;

  constructor(
    private projectsService: ProjectsService,
    private loginService: LoginService,
        private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = this.loginService.getCurrentUserId();
    if (userId) {
      this.projectsService.findByUserId(userId).subscribe({
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
    } else {
      this.projects = [];
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  }
}
