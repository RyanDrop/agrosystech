import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

export const isLoggedInGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
