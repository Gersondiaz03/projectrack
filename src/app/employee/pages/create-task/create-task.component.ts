import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  TasksService,
  EstadoTarea,
  Prioridad,
} from '../../../core/services/tasks.service';
import { LoginService } from '../../../auth/services/login.service';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.css',
})
export class CreateTaskComponent implements OnInit {
  form!: FormGroup;
  EstadoTarea = EstadoTarea;
  Prioridad = Prioridad;
  minDate: string = '';
  loading = false;

  private fb = inject(FormBuilder);
  private tasksService = inject(TasksService);
  private loginService = inject(LoginService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    const currentUser = this.loginService.getCurrentUser();
    const creadoPorId = currentUser?.id;
    this.route.paramMap.subscribe((params) => {
      const projectId = +(params.get('projectId') || '0');
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
        fechaInicio: ['', [this.dateNotBeforeTodayValidator.bind(this)]],
        fechaVencimiento: ['', [this.dateNotBeforeTodayValidator.bind(this)]],
        estado: [EstadoTarea.POR_HACER, Validators.required],
        prioridad: [Prioridad.MEDIA, Validators.required],
        categoria: [''],
        creadoPorId: [creadoPorId, Validators.required],
        projectId: [projectId, Validators.required],
      });
    });
  }

  dateNotBeforeTodayValidator(control: any) {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (inputDate < today) {
      return { beforeToday: true };
    }
    return null;
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.tasksService.create(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        const projectId = this.form.value.projectId;
        this.router.navigate([`/employee/project/${projectId}/kanban`]);
      },
      error: () => {
        this.loading = false;
        // Optionally show error
      },
    });
  }
}
