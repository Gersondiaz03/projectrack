import { LucideAngularModule, Bell, Mail } from 'lucide-angular';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';

import { NotificationsComponent } from './shared/notifications/notifications.component';
import { NotificationsService } from '../core/services/notifications.service';
import { SidebarComponent } from './shared/sidebar/sidebar.component';

@Component({
  selector: 'app-leader',
  imports: [
    SidebarComponent,
    RouterOutlet,
    NotificationsComponent,
    CommonModule,
    NgIf,
    LucideAngularModule,
  ],
  templateUrl: './leader.component.html',
  styleUrl: './leader.component.css',
})
export class LeaderComponent {
  readonly bell = Bell;
  readonly mail = Mail;
  showNotifications = false;
  unreadCount = 0;

  constructor(
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUnreadCount();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadUnreadCount();
    }
  }

  loadUnreadCount() {
    this.notificationsService
      .findMyNotifications()
      .subscribe((notifications) => {
        this.unreadCount = notifications.filter((n) => !n.leida).length;
      });
  }

  goToInbox() {
    this.router.navigate(['/leader/inbox']);
  }
}
