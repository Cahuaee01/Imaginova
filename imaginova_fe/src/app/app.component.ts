import { Component, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './_components/widgets/header/header.component';
import { FooterComponent } from './_components/widgets/footer/footer.component';
import twemoji from "twemoji";
import { PopupService } from './_services/popup.service';
import { SessionExpiredPopupComponent } from './_components/widgets/session-expired-popup/session-expired-popup.component';
import { OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SessionExpiredPopupComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements AfterViewInit, OnInit {
  popupVisible$!: Observable<boolean>;

  constructor(private popupService: PopupService) {}

  title = 'imaginova_fe';

  ngOnInit(): void { // Popup di sessione scaduta
    this.popupVisible$ = this.popupService.popupVisible$;
  }

  // Converte tutte le emoji e unicode in png
  ngAfterViewInit(): void {
    twemoji.parse(document.body, {
      folder: 'png',
      ext: '.png',
    });
  }

  // Gestione della chiusura del popup di sessione scaduta
  closePopup() {
    this.popupService.closePopup();
  }
}

