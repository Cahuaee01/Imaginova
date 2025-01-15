import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.scss']
})
export class CountdownTimerComponent implements OnChanges, OnDestroy {
  @Input() time: number | undefined;

  @Output() timerFinished = new EventEmitter<void>(); //evento per notificare il padre

  timeLeft: number = 0;
  timer: any;

  // Se l'orario inserito cambia (come a seguito del reload della challenge giornaliera) allora restarta il countdown
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['time'] && changes['time'].currentValue !== undefined) {
      this.startCountdown(changes['time'].currentValue);
    }
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  startCountdown(time: number) {
    const now = new Date();
    const nextNoon = new Date();
    nextNoon.setHours(time, 0, 0, 0);

    if (now.getTime() > nextNoon.getTime()) {
      nextNoon.setDate(nextNoon.getDate() + 1);
    }

    const timeDiff = nextNoon.getTime() - now.getTime();
    this.timeLeft = Math.floor(timeDiff / 1000);

    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.timer);
        this.timerFinished.emit(); // Notifica al padre
        this.startCountdown(time); // Restarta il timer
      }
    }, 1000);
  }

  // Formatta l'orario come HH:MM:SS
  formatTime() {
    const hours = Math.floor(this.timeLeft / 3600);
    const minutes = Math.floor((this.timeLeft % 3600) / 60);
    const seconds = this.timeLeft % 60;
    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  // Aggiunge uno 0 davanti alle cifre singole
  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}
