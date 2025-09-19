import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-delete-project',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close()"></div>
    <div class="modal-content text-black">
      <h3>¿Eliminar proyecto?</h3>
      <p>
        ¿Estás seguro de que deseas eliminar el proyecto <b>{{ projectName }}</b
        >? Esta acción no se puede deshacer.
      </p>
      <div class="modal-actions mt-6 flex gap-3 justify-end">
        <button (click)="close()" class="bg-gray-200 px-4 py-2 rounded">
          Cancelar
        </button>
        <button
          (click)="confirm()"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Eliminar
        </button>
      </div>
      <div *ngIf="error" class="error mt-2">{{ error }}</div>
    </div>
  `,
  styleUrls: ['./modal-delete-project.component.css'],
})
export class ModalDeleteProjectComponent {
  @Input() projectName: string = '';
  @Input() error: string | null = null;
  @Output() confirmDelete = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  confirm() {
    this.confirmDelete.emit();
  }

  close() {
    this.closeModal.emit();
  }
}
