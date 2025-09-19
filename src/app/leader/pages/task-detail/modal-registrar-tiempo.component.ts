import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-registrar-tiempo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close()"></div>
    <div class="modal-content">
      <h3>Registrar tiempo</h3>
      <input type="time" [(ngModel)]="start" placeholder="Desde" />
      <input type="time" [(ngModel)]="end" placeholder="Hasta" />
      <input type="text" [(ngModel)]="notes" placeholder="Notas" />
      <div class="modal-actions">
        <button (click)="register()" [disabled]="!start || !end">
          Registrar
        </button>
        <button (click)="close()">Cancelar</button>
      </div>
    </div>
  `,
  styleUrls: ['./modal-registrar-tiempo.component.css'],
})
export class ModalRegistrarTiempoComponent {
  @Output() tiempoRegistrado = new EventEmitter<{
    start: string;
    end: string;
    notes: string;
  }>();
  @Output() cerrar = new EventEmitter<void>();
  start = '';
  end = '';
  notes = '';

  register() {
    if (this.start && this.end) {
      this.tiempoRegistrado.emit({
        start: this.start,
        end: this.end,
        notes: this.notes,
      });
      this.start = '';
      this.end = '';
      this.notes = '';
    }
  }

  close() {
    this.cerrar.emit();
  }
}
