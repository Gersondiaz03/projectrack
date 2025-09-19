import { Component, EventEmitter, Output, Input } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-registrar-tiempo',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  template: `
    <div class="modal-backdrop" (click)="close()"></div>
    <div class="modal-content">
      <h3>Registrar tiempo</h3>
      <div class="mb-3">
        <label class="block text-sm mb-1">Usuario</label>
        <p-dropdown
          [options]="eligibleUsers"
          optionLabel="correoElectronico"
          [filter]="true"
          [(ngModel)]="selectedUserId"
          [showClear]="true"
          [editable]="false"
          [style]="{ width: '100%' }"
          [optionValue]="'id'"
          placeholder="Selecciona un usuario"
        ></p-dropdown>
      </div>
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
  @Input() eligibleUsers: { id: number; correoElectronico: string }[] = [];
  @Input() defaultUserId?: number | null;
  @Output() tiempoRegistrado = new EventEmitter<{
    start: string;
    end: string;
    notes: string;
    userId?: number;
  }>();
  @Output() cerrar = new EventEmitter<void>();
  start = '';
  end = '';
  notes = '';
  selectedUserId: number | null = null;

  ngOnInit() {
    this.selectedUserId = this.defaultUserId ?? null;
  }

  register() {
    if (this.start && this.end) {
      this.tiempoRegistrado.emit({
        start: this.start,
        end: this.end,
        notes: this.notes,
        userId: this.selectedUserId ?? undefined,
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
