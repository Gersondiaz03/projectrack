export interface TaskAssignment {
  id: number;
  taskId: number;
  usuarioId: number;
  tarea?: any;
  usuario?: any;
}

export interface CreateTaskAssignmentDto {
  taskId: number;
  usuarioId: number;
}

export interface UpdateTaskAssignmentDto
  extends Partial<CreateTaskAssignmentDto> {}
