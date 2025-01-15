import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountdownTimerComponent } from './countdown-timer/countdown-timer.component';
import { ChallengeItem } from '../../../_items/ChallengeType';
import { ChallengeService } from '../../../_services/challenge.service';
import twemoji from 'twemoji';
import { UserService } from '../../../_services/user.service';
import { Subscription } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { UploadPopupComponent } from './upload-popup/upload-popup.component';
import { ThrobberComponent } from '../throbber/throbber.component';

@Component({
  selector: 'app-daily-challenge',
  standalone: true,
  imports: [CountdownTimerComponent, CommonModule, ReactiveFormsModule, UploadPopupComponent, ThrobberComponent], 
  templateUrl: './daily-challenge.component.html',
  styleUrls: ['./daily-challenge.component.scss']
})
export class DailyChallengeComponent implements OnInit {
  @Output() challengeIdChange = new EventEmitter<number>();
  @Output() refreshCreations = new EventEmitter<void>();

  challenge: ChallengeItem = {} as ChallengeItem;

  emojiHtml: string | undefined;

  countdownTime: number | undefined; 

  isLogged = false;
  private subscription: Subscription | null = null;
  alreadyParticipated: boolean = false;

  isUploadPopupVisible: boolean = false;
  
  userId: number = 0;
  challengeId: number = 0;

  isLoading: boolean = false;

  constructor(private challengeService: ChallengeService, private authService: UserService) {}

  ngOnInit() {
    // Gestione emoji associata a festività
    const emoji = this.getHolidayEmoji();
    this.emojiHtml = twemoji.parse(emoji);

    // Caricamento della challenge
    this.loadChallenge();
  }

  // Carica la challenge giornaliera
  loadChallenge() {
    this.isLoading = true;
    this.challengeService.getCurrentChallenge().subscribe({
      next: (data) => {
        this.challenge = data.challenge; 
        if (this.challenge.challenge_id) {
          this.challengeId = this.challenge.challenge_id as number;
          this.challengeIdChange.emit(this.challenge.challenge_id); // Emette l'id della challenge alle creazioni da caricare
        }
        const challengeDate = new Date(data.challenge.challenge_date); // Imposta il countdown timer
        this.countdownTime = challengeDate.getHours(); 

        this.subscription = this.authService.isLogged$.subscribe((logged) => {
          this.isLogged = logged;
          if (this.isLogged) {
            this.checkUserParticipation(); // Verifica se l'utente ha già partecipato
          }
        this.isLoading = false;
        });
      },
      error: (err: any) => {
        this.challenge.description = err.error.message;
        console.log(err);
        this.isLoading = false;
      }
    });
  }

  // Verifica partecipazione utente alla challenge
  checkUserParticipation() {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      const user_id = Number(sessionStorage.getItem('user_id'));
      this.userId = user_id;
      if(user_id){
        this.challengeId = this.challenge.challenge_id as number;
        this.challengeService.checkParticipation(user_id as number, 
          this.challenge.challenge_id as number
        ).subscribe({
          next: (response) => {
            this.alreadyParticipated = response.alreadyParticipated;
          },
          error: (err) => {
            console.error('Error checking participation:', err);
          }
        });
      } else {
        console.error('No user_id found');
      }
    } else {
      console.error('No token found');
    }
  }  

  // Metodo per aggiornare la challenge al termine del timer
  onTimerFinished() {
    this.loadChallenge();
  }

  // Se l'utente ha già partecipato disabilita il pulsante I'm up
  refreshParticipation(){
    this.alreadyParticipated = true;
  }

  // Restituisce l'emoji associata alla data corrente
  getHolidayEmoji(): string {
    const today = new Date();
    const formattedDate = today.toISOString().slice(5, 10); 
    const holiday = this.holidayEmojis.find(h => h.date === formattedDate);
    return holiday ? holiday.emoji : ""; 
  }

  holidayEmojis = [
    { date: "01-01", emoji: "&#127881" }, // Spara coriandoli
    { date: "02-14", emoji: "&#128151" }, // Cuore
    { date: "03-17", emoji: "&#127808" }, // Quadrifoglio
    { date: "04-01", emoji: "&#129313" }, // Clown
    { date: "10-31", emoji: "&#128123" }, // Fantasma
    { date: "12-24", emoji: "&#127873"},  // Regalo
    { date: "12-25", emoji: "&#127877" }, // Babbo Natale
    { date: "12-31", emoji: "&#127878" }, // Fuochi d'artificio
  ];

  // Apre il popup di inserimento della creazione
  toggleUploadPopup(): void {
    this.isUploadPopupVisible = !this.isUploadPopupVisible;
    this.refreshCreations.emit();
  }  

}
