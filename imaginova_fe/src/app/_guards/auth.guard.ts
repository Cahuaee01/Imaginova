import { CanActivateFn } from '@angular/router';
import { UserService } from '../_services/user.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(UserService);
  const router = inject(Router);
  const token = authService.getToken();

  if (token) {
    const isAuthenticated = authService.verifyJWT(token as string);
    if (isAuthenticated) {
      return true;
    }
  }

  //fallimento
  authService.logout();
  router.navigate(['/public/homepage']);
  return false;
};
