import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { EmailsService } from '../../../../core/services/emails.service';
import { LoginService } from '../../../../auth/services/login.service';
import { Email } from '../../../../core/model/email.model';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.css',
})
export class InboxComponent implements OnInit {
  emails: Email[] = [];
  loading = true;
  error: string | null = null;
  myUserId: number | null = null;
  private loginService = inject(LoginService);
  constructor(
    private emailsService: EmailsService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.myUserId = this.loginService.getCurrentUserId();
    this.emailsService.findMyEmails().subscribe({
      next: (emails) => {
        this.emails = emails;
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.error = 'Error cargando los correos';
        this.loading = false;
        this.cdRef.detectChanges();
      },
    });
  }

  openEmail(email: Email) {
    this.router.navigate(['../conversation', email.id]);
  }
}
