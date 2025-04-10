import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'agro-auth',
  imports: [RouterModule],
  template: '  <router-outlet />',
  styleUrl: './auth.layout.scss',
})
export class AuthLayout {}
