import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CreationService } from '../../../../_services/creation.service';
import { UserService } from '../../../../_services/user.service';
import { CommonModule } from '@angular/common';
import { UserItem } from '../../../../_items/UserType';
import { CreationCarouselComponent } from '../../../widgets/creation-carousel/creation-carousel.component';
import { ThrobberComponent } from '../../../widgets/throbber/throbber.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CreationCarouselComponent, ThrobberComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  user_id: number | undefined;
  user_info: UserItem | undefined;

  totalLikes: number | undefined;
  totalCreations: number | undefined;
  bestCreation: number = 0;
  firstCreationDate: string | undefined;
  firstCreationStatus: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 6; 
  disableNext: boolean = false;

  sortBy: string = 'date';
  order: string = 'desc';
  media: string = 'all';
  filterStatus: boolean = false;

  selectedCreationIndex: number = 0; // Indice dell'elemento selezionato
  popupPosition = { top: '0px', left: '0px' };
  isFullCreationVisible: boolean = false;
  fullscreenImagePath: string = '';
  isFullscreenVisible: boolean = false;

  isLoading: boolean = false;

  constructor (private route: ActivatedRoute, private creationService: CreationService, private authService: UserService) {}

  ngOnInit(): void {
      // Preleva l'user_id dalla route
      this.route.params.subscribe((params) => {
        this.user_id = +params['user_id'];
        this.currentPage = 1; 
        this.disableNext = false; 
        this.loadProfile();
      });      

      this.filter_Form.patchValue({
      sortBy: 'date',
      order: 'desc',
      media: 'all'
    });
  }

  filter_Form = new FormGroup(
      {
        sortBy: new FormControl('', []),
        order: new FormControl('', []),
        media: new FormControl('', [])
      },
    );

  // Aggiunge i filtri
  addFilters(){
    this.sortBy = this.filter_Form.value.sortBy as string;
    this.order = this.filter_Form.value.order as string;
    this.media = this.filter_Form.value.media as string;
    const isMobile = window.innerWidth <= 768; 
    if (isMobile) {
      this.filterStatus = !this.filterStatus; 
    } else {
      this.filterStatus = true; 
    }
    this.currentPage = 1;
  }

  // Apre la barra dei filtri
  openFilters() {
    this.filterStatus = !this.filterStatus; 
  } 

  // Apre il popup per la visione dell'intera creazione
  togglePopup(index: number | null = null, event?: MouseEvent) {
    this.selectedCreationIndex = index as number;
    
    if (event) {
      const x = event.clientX;
      const y = event.clientY;
      this.popupPosition = { top: `${y}px`, left: `${x}px` };
    }
  
    this.isFullCreationVisible = !this.isFullCreationVisible;
  }  

  // Preleva la data della creazione
  getDayFromCreationDate(date: Date): string {
    const parsedDate = new Date(date);
    const month = parsedDate.getMonth() + 1;
    return `${month.toString()}/${parsedDate.getDate().toString()}/${parsedDate.getFullYear().toString()}`;
  }  

  // Carica il profilo utente
  loadProfile(){
    this.isLoading = true;
    this.authService.getProfile(this.user_id as number).subscribe({
      next: (response) => {
        this.user_info = response.user as UserItem;
        this.totalLikes = response.stats.totalLikes;
        this.totalCreations = response.stats.totalCreations;
        if(response.stats.bestCreation?.positiveVotes){
          this.bestCreation = response.stats.bestCreation?.positiveVotes as number;
        }
        if (response.stats.firstCreationDate) {
          this.firstCreationStatus = true;
          this.firstCreationDate = this.getDayFromCreationDate(response.stats.firstCreationDate);
        } else {
          this.firstCreationStatus = false;
          this.firstCreationDate = '';
        }    
        this.isLoading = false;    
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }
}
