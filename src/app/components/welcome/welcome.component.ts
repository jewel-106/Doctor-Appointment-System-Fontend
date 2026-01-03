import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './welcome.component.html'

})
export class WelcomeComponent { }