

// src/app/components/welcome/welcome.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="container text-center py-5">
      <h1 class="display-4">Welcome to Doctor App</h1>
      <p class="lead">Manage your appointments easily</p>
      <a routerLink="/login" class="btn btn-success btn-lg me-3">Login</a>
      <a routerLink="/register" class="btn btn-primary btn-lg">Register</a>
    </div>
  `
})
export class WelcomeComponent {}