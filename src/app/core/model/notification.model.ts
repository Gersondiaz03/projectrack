export interface Notification {
  id: number;
  userId: number;
  mensaje: string;
  tipo?: string;
  fechaCreacion: Date;
  leida: boolean;
  usuario?: any;
}

export interface CreateNotificationDto {
  userId: number;
  mensaje: string;
  tipo?: string;
  leida?: boolean;
}

export interface UpdateNotificationDto extends Partial<CreateNotificationDto> {}
