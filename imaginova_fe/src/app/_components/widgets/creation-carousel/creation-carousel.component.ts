import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CreationItem } from '../../../_items/CreationType';
import { CreationService } from '../../../_services/creation.service';
import { CommonModule } from '@angular/common';
import { CreationComponent } from '../creation-small/creation.component';
import { UserService } from '../../../_services/user.service';
import { config } from '../../../config/config';
import { CreationPopupComponent } from '../creation-popup/creation-popup.component';
import { ActivatedRoute } from '@angular/router';
import { ThrobberComponent } from '../throbber/throbber.component';

@Component({
  selector: 'app-creation-carousel',
  standalone: true,
  imports: [CommonModule, CreationComponent, CreationPopupComponent, ThrobberComponent],
  templateUrl: './creation-carousel.component.html',
  styleUrl: './creation-carousel.component.scss'
})
export class CreationCarouselComponent implements OnInit, OnChanges {
  @Input() challenge_id: number | undefined;

  @Input() isGrid: boolean = false;
  @Input() showNavButtons = true;

  @Input() sortBy: string = 'likes';
  @Input() order: string = 'desc';
  @Input() media: string = 'all';

  creations: CreationItem[] = [];

  currentPage: number = 1;
  @Input() itemsPerPage: number = 2; 
  disableNext: boolean = false; 
 
  selectedCreationIndex: number = 0; // Indice dell'elemento selezionato

  isLogged = false;

  isFullCreationVisible: boolean = false;
  isFullscreenVisible: boolean = false;

  user_id: number | undefined;

  isLoading: boolean = false;

  constructor(private creationService: CreationService, private authService: UserService, private route: ActivatedRoute) {}

  ngOnInit() { // Verifica se l'utente è loggato
    this.authService.isLogged$.subscribe((logged) => {
      this.isLogged = logged;
    }); 

    // Preleva l'use_id dalla route
    this.route.params.subscribe((params) => {
      this.user_id = +params['user_id'];
      this.creations = []; // Reset dello stato delle creazioni
      this.currentPage = 1; // Resetta la paginazione
      this.disableNext = false; // Resetta lo stato di navigazione
      this.loadCreations();
    });   
  }

  // Se vengono applicati dei filtri e quindi cambiati ricarica le creazioni con quei filtri
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sortBy'] || changes['order'] || changes['media'] || changes['challenge_id']) {
      this.route.params.subscribe((params) => {
        this.user_id = +params['user_id'];
        this.creations = []; // Reset dello stato delle creazioni
        this.currentPage = 1; // Resetta la paginazione
        this.disableNext = false; // Resetta lo stato di navigazione
        this.loadCreations();
      });   
    }
  }

  // Carica le creazioni
  loadCreations() {
    this.isLoading = true; 
    if(!this.challenge_id && !this.isGrid){ // Impostazione non riconosciuta
      this.creations = []; 
      this.currentPage = 1; 
      this.disableNext = false;
      this.isLoading = false; 
    } else if (this.isGrid && this.user_id) { // Se la modalità è griglia e c'è lo user id mostra le creazioni di un utente specifico
      this.creationService
      .getUserCreations(this.itemsPerPage, this.currentPage, this.sortBy as string, this.order as string, this.media as string, this.user_id as number)
      .subscribe({
        next: (response: any) => {
          this.creations = response.creations;
          this.refreshVotes();
          if (!response.hasNextPage) {
            this.disableNext = true;
          } else {
            this.disableNext = false;
          }
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error(err);
          this.creations = [];
          this.disableNext = true;
          this.isLoading = false;
        },
      });
    } else { // Altrimenti mostra le creazioni relative ad una challenge
      this.creationService
      .getChallengeCreations(this.itemsPerPage, this.currentPage, this.sortBy, this.order, this.challenge_id as number, this.media)
      .subscribe({
        next: (response: any) => {
          if (response?.creations?.data && Array.isArray(response.creations.data)) {
            this.creations = response.creations.data;
            this.refreshVotes();
            if (!response.creations.hasNextPage) {
              this.disableNext = true;
            } else {
              this.disableNext = false;
            }
          } else {
            this.creations = [];
            this.disableNext = true;
          }
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error(err);
          this.creations = [];
          this.disableNext = true;
          this.isLoading = false;
        },
      });
    }
  }

  // Funzione per fare il refresh dei voti
  refreshVotes() {
    if(this.creations.length === 0 || !this.isLogged) {
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

  // Preleva il path dell'immagine
  getImageSource(creation: CreationItem): string {
    const baseUrl = config.apiUrl;
    const formattedPath = creation.media_path?.replace(/\\/g, '/');
    return `${baseUrl}/${formattedPath}`;
  }  

  // Preleva la data della creazione
  getDayFromCreationDate(date: Date): string {
    const parsedDate = new Date(date);
    const month = parsedDate.getMonth() + 1;
    return `${month.toString()}/${parsedDate.getDate().toString()}/${parsedDate.getFullYear().toString()}`;
  }  

  // Va alla pagina seguente del carosello
  nextPage() {
    if (!this.disableNext) {
      this.currentPage++;
      this.loadCreations();
    }
  }

  // Va alla pagina precedente del carosello
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCreations();
    }
  }

  // Apre il popup per la visione dell'intera creazione
  togglePopup(index: number | null = null) {
    if (index !== null) {
      this.selectedCreationIndex = index;
      this.isFullCreationVisible = true;
    } else {
      this.isFullCreationVisible = false;
    }
  }  

  // Imposta le medaglie del podio
  getMedalImage(index: number): string {
    const medals = [
        '/gold.png',   // Primo posto
        '/silver.png', // Secondo posto
        '/bronze.png'  // Terzo posto
    ];
    return medals[index] || '';
  }

  // Preleva l'indice globale della creazione in modo da assegnare la medaglia correttamente
  getGlobalIndex(index: number): number {
    const globalIndex = (this.currentPage - 1) * this.itemsPerPage + index;
    return globalIndex;
  }
    
}

