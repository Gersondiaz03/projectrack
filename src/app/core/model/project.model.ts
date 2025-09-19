// src/app/projects/project.model.ts

export enum EstadoProyecto {
  ABIERTO = 'Abierto',
  EN_PROGRESO = 'En Progreso',
  COMPLETADO = 'Completado',
  ARCHIVADO = 'Archivado',
  PAUSADO = 'Pausado',
}

export interface Project {
  id: number;
  nombre: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: EstadoProyecto;
  creadoPorId: number;
  creadoPor?: any;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CreateProjectDto {
  nombre: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: EstadoProyecto;
  creadoPorId: number;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}
