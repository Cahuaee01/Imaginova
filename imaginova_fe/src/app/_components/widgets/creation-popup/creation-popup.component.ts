import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreationItem } from '../../../_items/CreationType';
import { UserService } from '../../../_services/user.service';
import { CreationService } from '../../../_services/creation.service';
import { CommonModule } from '@angular/common';
import { CreationBigComponent } from '../creation-big/creation-big.component';

@Component({
  selector: 'app-creation-popup',
  standalone: true,
  imports: [CommonModule, CreationBigComponent],
  templateUrl: './creation-popup.component.html',
  styleUrl: './creation-popup.component.scss'
})
export class CreationPopupComponent {
  @Input() selectedCreationIndex!: number;

  @Input() creations: CreationItem[] = [];

  @Input() isPopupOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  disableNext: boolean = false; //stato del pulsante "Next"

  fullscreenImagePath: string = '';

  voteStatus: 'like' | 'dislike' | null = null;

  constructor(private authService: UserService, private creationService: CreationService) {}

  // Va alla precedente creazione del carosello
  navigateLeft() {
    if (this.selectedCreationIndex !== null && this.selectedCreationIndex > 0) {
      this.selectedCreationIndex--;
      this.refreshVotes();
    }
  }

  // Va alla successiva creazione del carosello
  navigateRight() {
    if (this.selectedCreationIndex !== null && this.selectedCreationIndex < this.creations.length - 1) {
      this.selectedCreationIndex++;
      this.refreshVotes();
    }
  }

  // Emette la chiusura del popup
  closePopup(){
    this.close.emit();
  }

  // Funzione per aprire il popup l'intera creazione
  openCreationFullScreen(imagePath: string): void {
    this.fullscreenImagePath = imagePath;
    this.isPopupOpen = true;
  }

  // Funzione per chiudere il popup dell'intera creazione
  closeCreationFullScreen(): void {
    this.fullscreenImagePath = '';
    this.isPopupOpen = false;
    this.closePopup();
  }

  // Funzione per fare il refresh dei voti
  refreshVotes() {
    if(this.creations.length === 0) {
      return;
    }
    this.creationService.refreshVote(
      this.creations[this.selectedCreationIndex].challenge,
      this.creations[this.selectedCreationIndex].creation_id as number
    ).subscribe({
      next: (data) => {
        this.creations[this.selectedCreationIndex].positiveVotes = data.positiveVotes;
        this.creations[this.selectedCreationIndex].negativeVotes = data.negativeVotes;
  
        let user_id = Number(this.authService.getUser());
  
        // Verifica se non ci sono voti
        if (!data.who_voted || data.who_voted.length === 0) {
          this.creations[this.selectedCreationIndex].voteStatus = 'null';
          return;
        }
  
        // Verifica se nei voti presenti c'è quello dell'utente loggato e nel caso lo colora opportunamente
        for (let i = 0; i < data.who_voted.length; i++) {
          if (data.who_voted[i].imaginova_user == user_id) {
            // L'utente ha votato e quindi coloro il pulsante
            this.creations[this.selectedCreationIndex].voteStatus = data.who_voted[i].feedback_value ? 'like' : 'dislike';
            break; 
          }
        }
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

}
