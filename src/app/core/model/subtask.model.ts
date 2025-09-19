export interface Subtask {
  id: number;
  taskId: number;
  titulo: string;
  texto?: string;
  completada: boolean;
  tarea?: any;
  creadoPorId?: number;
  creadoPor?: any;
  fechaCreacion?: string | Date;
  completadaPorId?: number;
  completadaPor?: any;
  fechaCompletada?: string | Date;
}

export interface CreateSubtaskDto {
  taskId: number;
  titulo: string;
  texto?: string;
  completada?: boolean;
  creadoPorId?: number;
}

export interface UpdateSubtaskDto extends Partial<CreateSubtaskDto> {
  completadaPorId?: number;
  fechaCompletada?: string | Date;
}
