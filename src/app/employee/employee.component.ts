import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SidebarComponent } from './shared/sidebar/sidebar.component';

@Component({
  selector: 'app-employee',
  imports: [SidebarComponent, RouterOutlet, CommonModule],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeComponent {
  sidebarOpen = false;
  isLargeScreen = window.innerWidth >= 1024;

  @HostListener('window:resize', [])
  onResize() {
    this.isLargeScreen = window.innerWidth >= 1024;
    if (this.isLargeScreen) {
      this.sidebarOpen = false;
    }
  }
}
