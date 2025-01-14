import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  private popupVisibleSubject = new BehaviorSubject<boolean>(false);
  popupVisible$ = this.popupVisibleSubject.asObservable();

  showSessionExpiredPopup(): Observable<void> {
    this.popupVisibleSubject.next(true);
    //completa l'Observable dopo un secondo
    return new Observable<void>((observer) => {
      setTimeout(() => {
        observer.next();
        observer.complete();
      }, 1000); 
    });
  }

  closePopup() {
    this.popupVisibleSubject.next(false);
  }
}
