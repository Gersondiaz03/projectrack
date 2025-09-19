import { LucideAngularModule, Bell, Mail } from 'lucide-angular';
import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { NotificationsComponent } from './shared/notifications/notifications.component';
import { NotificationsService } from '../core/services/notifications.service';
import { SidebarComponent } from './shared/sidebar/sidebar.component';


@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    SidebarComponent,
    RouterOutlet,
    NotificationsComponent,
    CommonModule,
    NgIf,
    LucideAngularModule,
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css',
})
export class ClientComponent {
  readonly bell = Bell;
  readonly mail = Mail;
  showNotifications = false;
  unreadCount = 0;

  constructor(
    private notificationsService: NotificationsService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUnreadCount();
    this.cdRef.detectChanges();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadUnreadCount();
    }
    this.cdRef.detectChanges();
  }

  loadUnreadCount() {
    this.notificationsService
      .findMyNotifications()
      .subscribe((notifications) => {
        this.unreadCount = notifications.filter((n) => !n.leida).length;
        this.cdRef.detectChanges();
      });
  }
}
