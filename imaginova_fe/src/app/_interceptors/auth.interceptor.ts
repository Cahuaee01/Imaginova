import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpParams, HttpEvent } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { PopupService } from '../_services/popup.service';

export function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  //nella versione più recente con il sistema di stand-alone applications, Angular richiede che
  //gli interceptor siano definiti come funzioni (HttpInterceptorFn) invece che come classi.
  //per questo  Angular non ha un contesto di classe per fare l'iniezione tramite costruttore, quindi non è possibile usare il tradizionale approccio di iniezione tramite costruttore
  const authService = inject(UserService);
  const router = inject(Router);
  const popupService = inject(PopupService);

  const token = authService.getToken();
  const user_id = Number(authService.getUser());

  let params = request.params || new HttpParams();

  if (user_id) {
    params = params.set('imaginova_user', user_id);
  }

  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: 'Bearer ' + token,
      },
      params,
    });
  } else if (user_id) {
    request = request.clone({
      params,
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        // Token scaduto o non valido
        return popupService.showSessionExpiredPopup().pipe(
          switchMap(() => authService.logout()), 
          switchMap(() => router.navigateByUrl('/public/homepage')), 
          switchMap(() => next(request)) 
        );
      }
      return throwError(() => error); //in caso di errore diverso, propagazione dell'errore
    })
  );
}
