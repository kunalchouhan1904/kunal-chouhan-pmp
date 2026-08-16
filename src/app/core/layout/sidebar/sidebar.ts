import {
  Component,
  HostListener,
  OnInit
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar implements OnInit {

  collapsed = false;

  mobileOpen = false;

  isMobile = false;

  ngOnInit(): void {
    this.updateViewport();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateViewport();
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.mobileOpen = !this.mobileOpen;
      return;
    }

    this.collapsed = !this.collapsed;
  }

  onNavigationClick(): void {
    if (this.isMobile) {
      this.mobileOpen = false;
    }
  }

  closeMobileSidebar(): void {
    this.mobileOpen = false;
  }

  private updateViewport(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.isMobile =
      window.matchMedia('(max-width: 768px)').matches;

    if (!this.isMobile) {
      this.mobileOpen = false;
    }
  }
}
