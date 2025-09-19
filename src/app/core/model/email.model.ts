export interface Email {
  id: number;
  destinatarioId: number;
  remitenteId: number;
  asunto: string;
  cuerpo: string;
  fechaEnvio: Date;
  destinatario?: any;
  remitente?: any;
}

export interface CreateEmailDto {
  destinatarioId: number;
  remitenteId: number;
  asunto: string;
  cuerpo: string;
}

export interface UpdateEmailDto extends Partial<CreateEmailDto> {}
