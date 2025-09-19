import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
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
    this.notificationsService.findMyNotifications().subscribe((data) => {
      this.notifications = data;
      this.loading = false;
      this.cdRef.detectChanges();
    });
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
    this.cdRef.detectChanges();
  }
}
