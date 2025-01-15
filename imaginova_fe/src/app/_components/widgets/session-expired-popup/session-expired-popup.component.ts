import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-session-expired-popup',
  standalone: true,
  imports: [],
  templateUrl: './session-expired-popup.component.html',
  styleUrl: './session-expired-popup.component.scss'
})
export class SessionExpiredPopupComponent {
  @Output() closed = new EventEmitter<void>();

  // Emette la chiusura del popup di sessione scaduta
  closePopup() {
    this.closed.emit();
  }
}
