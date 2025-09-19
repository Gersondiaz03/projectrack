import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ProjectsService } from '../../../core/services/projects.service';
import { EstadoProyecto } from '../../../core/model/project.model';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrl: './create-project.component.css',
})
export class CreateProjectComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  estadoProyecto = EstadoProyecto;
  estadoProyectoEntries: [keyof typeof EstadoProyecto, string][];

  constructor(
    private fb: FormBuilder,
    private projectsService: ProjectsService,
    private router: Router
  ) {
    this.estadoProyectoEntries = Object.entries(EstadoProyecto) as [
      keyof typeof EstadoProyecto,
      string
    ][];
    this.form = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
      descripcion: [''],
      fechaInicio: [''],
      fechaFin: [''],
      estado: [''],
    });
  }

  ngOnInit(): void {}

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;
    const dto = { ...this.form.value };
    this.projectsService.create(dto).subscribe({
      next: (_project: any) => {
        this.loading = false;
        this.router.navigate(['/admin/main']); // Redirect to admin/main after successful creation
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.message || 'Error al crear el proyecto';
      },
    });
  }

  get nombre() {
    return this.form.get('nombre');
  }
  get descripcion() {
    return this.form.get('descripcion');
  }
  get fechaInicio() {
    return this.form.get('fechaInicio');
  }
  get fechaFin() {
    return this.form.get('fechaFin');
  }
  get estado() {
    return this.form.get('estado');
  }
}
