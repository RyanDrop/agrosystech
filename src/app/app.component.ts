import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'agro-root',
  template: '<router-outlet />',
})
export class AppComponent {}
