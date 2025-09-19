export enum RolProyecto {
  ADMIN = 'Administrador',
  LIDER = 'Líder de Proyecto',
  EMPLEADO = 'Empleado',
  CLIENTE = 'Cliente',
}

export interface ProjectUser {
  id: number;
  proyectoId: number;
  usuarioId: number;
  rolEnProyecto: RolProyecto;
  proyecto?: any;
  usuario?: any;
}

export interface CreateProjectUserDto {
  proyectoId: number;
  usuarioId: number;
  rolEnProyecto: RolProyecto;
}

export interface UpdateProjectUserDto extends Partial<CreateProjectUserDto> {}
