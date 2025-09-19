import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, AfterViewChecked, } from '@angular/core';
import { LucideAngularModule, Plus, ClipboardList, UserRound, SquareUserRound, } from 'lucide-angular';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Project, EstadoProyecto } from '../../../core/model/project.model';
import { ProjectsService } from '../../../core/services/projects.service';
import { LoginService } from '../../../auth/services/login.service';
import { User } from '../../../core/model/user.model';


interface GroupedProjects {
  status: EstadoProyecto;
  displayName: string;
  projects: Project[];
}

interface VirtualScrollItem {
  type: 'header' | 'project';
  data: GroupedProjects | Project;
  groupColor?: string;
  groupDisplayName?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [LucideAngularModule, CommonModule, RouterLink, ScrollingModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit, AfterViewChecked {
  readonly plus = Plus;
  readonly clipboardList = ClipboardList;
  readonly userRound = UserRound;
  readonly squareUserRound = SquareUserRound;
  projects$: Project[] = [];
  groupedProjects: GroupedProjects[] = [];
  virtualScrollItems: VirtualScrollItem[] = [];
  currentUser: User | null = null;
  showCreateProjectModal = false;

  projectColors = [
    'bg-green-500',
    'bg-blue-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-red-500',
  ];
  statusConfig: {
    [key in EstadoProyecto]: { displayName: string; color: string };
  } = {
    [EstadoProyecto.EN_PROGRESO]: {
      displayName: 'Proyectos En Progreso',
      color: 'bg-blue-500',
    },
    [EstadoProyecto.ABIERTO]: {
      displayName: 'Proyectos Abiertos',
      color: 'bg-yellow-500',
    },
    [EstadoProyecto.PAUSADO]: {
      displayName: 'Proyectos Pausados',
      color: 'bg-yellow-500',
    },
    [EstadoProyecto.COMPLETADO]: {
      displayName: 'Proyectos Completados',
      color: 'bg-green-500',
    },
    [EstadoProyecto.ARCHIVADO]: {
      displayName: 'Proyectos Archivados',
      color: 'bg-gray-500',
    },
  };

  constructor(
    private projectsService: ProjectsService,
    private loginService: LoginService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.loginService.getCurrentUser?.() ?? null;
    const loadProjects = () => {
      this.projectsService.findAll().subscribe({
        next: (data) => {
          this.projects$ = data;
          this.groupProjectsByStatus();
          this.createVirtualScrollItems();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to load projects', err);
        },
      });
    };
    loadProjects();
    this.projectsService.projectsChanged$?.subscribe?.(() => {
      loadProjects();
    });
  }

  private groupProjectsByStatus(): void {
    const grouped = new Map<EstadoProyecto, Project[]>();
    Object.values(EstadoProyecto).forEach((status) => {
      grouped.set(status, []);
    });
    this.projects$.forEach((project) => {
      const status = project.estado || EstadoProyecto.ABIERTO;
      if (grouped.has(status)) {
        grouped.get(status)!.push(project);
      }
    });
    this.groupedProjects = Array.from(grouped.entries())
      .map(([status, projects]) => ({
        status,
        displayName: this.statusConfig[status].displayName,
        projects,
        color: this.statusConfig[status].color,
      }))
      .filter((group) => group.projects.length > 0);
  }

  private createVirtualScrollItems(): void {
    this.virtualScrollItems = [];
    if (!this.groupedProjects || this.groupedProjects.length === 0) {
      return;
    }
    this.groupedProjects.forEach((group) => {
      this.virtualScrollItems.push({
        type: 'header',
        data: group,
        groupDisplayName: group.displayName,
      });
      group.projects.forEach((project) => {
        this.virtualScrollItems.push({
          type: 'project',
          data: project,
          groupDisplayName: group.displayName,
        });
      });
    });
  }

  ngAfterViewChecked(): void {
    try {
      if ((window as any).HSStaticMethods) {
        (window as any).HSStaticMethods.autoInit(['accordion']);
      }
    } catch (error) {
      console.error('Error initializing HSStaticMethods:', error);
    }
  }

  getColor(index: number): string {
    return this.projectColors[index % this.projectColors.length];
  }

  getProject(item: VirtualScrollItem): Project {
    return item.data as Project;
  }

  getGroupData(item: VirtualScrollItem): GroupedProjects {
    return item.data as GroupedProjects;
  }

  trackVirtualItem(index: number, item: VirtualScrollItem): string {
    if (item.type === 'header') {
      return `header-${(item.data as GroupedProjects).status}-${index}`;
    } else {
      return `project-${(item.data as Project).id}-${index}`;
    }
  }

  logout(): void {
    this.loginService.logout();
  }

  openCreateProjectModal() {
    this.showCreateProjectModal = true;
  }

  handleProjectCreated(project: Project) {
    this.closeCreateProjectModal();
  }

  closeCreateProjectModal() {
    this.showCreateProjectModal = false;
  }
}
