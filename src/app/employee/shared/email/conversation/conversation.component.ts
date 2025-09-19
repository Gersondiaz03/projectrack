import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NotificationsService } from '../../../../core/services/notifications.service';
import { EmailsService } from '../../../../core/services/emails.service';
import { Email } from '../../../../core/model/email.model';

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.css',
})
export class ConversationComponent implements OnInit {
  email: Email | null = null;
  loading = true;
  error: string | null = null;
  responseForm!: FormGroup;
  sending = false;

  constructor(
    private route: ActivatedRoute,
    private emailsService: EmailsService,
    private notificationsService: NotificationsService,
    private fb: FormBuilder,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const emailId = Number(this.route.snapshot.paramMap.get('id'));
    if (!emailId) {
      this.error = 'Correo no encontrado';
      this.loading = false;
      this.cdRef.detectChanges();
      return;
    }
    this.emailsService.findOne(emailId).subscribe({
      next: (email) => {
        this.email = email;
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar el correo';
        this.loading = false;
        this.cdRef.detectChanges();
      },
    });
    this.responseForm = this.fb.group({
      cuerpo: ['', [Validators.required, Validators.maxLength(1000)]],
    });
  }

  sendResponse() {
    if (!this.email || this.responseForm.invalid) return;
    this.sending = true;
    this.cdRef.detectChanges();
    const { cuerpo } = this.responseForm.value;
    this.emailsService
      .sendEmail(this.email.remitenteId, 'Re: ' + this.email.asunto, cuerpo)
      .subscribe({
        next: () => {
          this.notificationsService
            .create({
              userId: this.email!.remitenteId,
              mensaje: `Has recibido una respuesta a tu correo: ${
                this.email!.asunto
              }`,
              tipo: 'email',
              leida: false,
            })
            .subscribe();
          this.router.navigate(['../../inbox']);
        },
        error: () => {
          this.error = 'Error enviando la respuesta';
          this.sending = false;
          this.cdRef.detectChanges();
        },
      });
  }
}
