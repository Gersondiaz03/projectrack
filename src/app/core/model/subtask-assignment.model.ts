export interface SubtaskAssignment {
  id: number;
  subtaskId: number;
  usuarioId: number;
  subtarea?: any;
  usuario?: any;
}

export interface CreateSubtaskAssignmentDto {
  subtaskId: number;
  usuarioId: number;
}

export interface UpdateSubtaskAssignmentDto
  extends Partial<CreateSubtaskAssignmentDto> {}
