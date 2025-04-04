import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzCardComponent } from 'ng-zorro-antd/card';

@Component({
  selector: 'agro-auth',
  imports: [NzCardComponent, RouterModule],
  template: '  <router-outlet />',
  styleUrl: './auth.layout.scss',
})
export class AuthLayout {}
