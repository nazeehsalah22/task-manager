import { Component, inject, signal, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Sidebar } from '../sidebar/sidebar';
import { SearchService } from '../../core/services/search';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, FormsModule, MatSidenavModule, MatToolbarModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, Sidebar],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {
  searchService = inject(SearchService);
  private breakpointObserver = inject(BreakpointObserver);

  isMobile = signal(false);
  sidenavOpen = signal(true);

  constructor() {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile.set(result.matches);
      // Close sidenav by default on mobile, open on desktop
      this.sidenavOpen.set(!result.matches);
    });
  }

  toggleSidenav() {
    this.sidenavOpen.update(open => !open);
  }
}
