import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationsService } from '../../../core/services/notifications.service';
import { Notification } from '../../../core/model/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent {
  notifications: Notification[] = [];
  loading = true;
  @Output() close = new EventEmitter<void>();

  constructor(
    private notificationsService: NotificationsService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const userId = this.notificationsService['loginService'].getCurrentUserId();
    console.log(
      '[NotificationsComponent] Current userId for notifications:',
      userId
    );
    if (!userId) {
      console.warn(
        '[NotificationsComponent] No userId found. User may not be logged in.'
      );
    }
    this.notificationsService.findMyNotifications().subscribe(
      (data) => {
        this.notifications = data;
        this.loading = false;
        this.cdRef.detectChanges();
        console.log('[NotificationsComponent] Notifications loaded:', data);
      },
      (err) => {
        this.loading = false;
        this.cdRef.detectChanges();
        console.error(
          '[NotificationsComponent] Error loading notifications:',
          err
        );
      }
    );
  }

  markAsRead(notification: Notification) {
    if (!notification.leida) {
      this.notificationsService.markAsRead(notification.id).subscribe(() => {
        notification.leida = true;
        this.cdRef.detectChanges();
      });
    }
  }

  markAllAsRead() {
    this.notificationsService.markAllAsRead().subscribe((updated) => {
      this.notifications.forEach((n) => (n.leida = true));
      this.cdRef.detectChanges();
    });
  }

  closeModal() {
    this.close.emit();
  }
}
