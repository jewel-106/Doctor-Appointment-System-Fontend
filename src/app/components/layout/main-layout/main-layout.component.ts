import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);

    isSidebarOpen = false;
    userName = 'User';
    userRole = '';
    userAvatar: string | null = null;

    ngOnInit() {
        const user = this.authService.getUser();
        if (user) {
            this.userName = user.name;
            this.userRole = user.role;
            this.userAvatar = user.avatar;
        }
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
