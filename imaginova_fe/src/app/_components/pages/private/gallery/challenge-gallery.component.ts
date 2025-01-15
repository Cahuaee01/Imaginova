import { Component, OnInit } from '@angular/core';
import { CreationCarouselComponent } from '../../../widgets/creation-carousel/creation-carousel.component';
import { CommonModule } from '@angular/common';
import { ChallengeItem } from '../../../../_items/ChallengeType';
import { ChallengeService } from '../../../../_services/challenge.service';
import { FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ThrobberComponent } from '../../../widgets/throbber/throbber.component';

@Component({
  selector: 'app-challenge-gallery',
  standalone: true,
  imports: [CommonModule, CreationCarouselComponent, ReactiveFormsModule, ThrobberComponent],
  templateUrl: './challenge-gallery.component.html',
  styleUrls: ['./challenge-gallery.component.scss']
})
export class ChallengeGalleryComponent implements OnInit {
  challenges: ChallengeItem[] = [];

  itemsPerPage: number = 2;
  currentPage: number = 1;
  disableNext: boolean = false; 
  totalPages: number | undefined;

  startDate: string | undefined;
  endDate: string | undefined;
  sortBy: string = 'date';
  order: string = 'desc';
  todayDate: string | undefined;
  twoMonthsAgoDate: string | undefined;
  filterStatus: boolean = false;
  
  isLoading: boolean = false;

  constructor(private challengeService: ChallengeService, private router: Router) {}

  ngOnInit() {
    // Imposta le date di default del filtro ad oggi e due mesi prima di oggi
    this.todayDate = this.getTodayDate(); 
    this.twoMonthsAgoDate = this.getTwoMonthsAgoDate(); 
  
    this.filter_Form.patchValue({
      startDate: this.twoMonthsAgoDate,
      endDate: this.todayDate,
      sortBy: 'date',
      order: 'desc'
    });
  
    this.loadChallenges();
  }
  
  filter_Form = new FormGroup(
    {
      startDate: new FormControl('', []),
      endDate: new FormControl('', []),
      sortBy: new FormControl('', []),
      order: new FormControl('', [])
    },
    { validators: this.dateRangeValidator }
  );

  // Validatore personalizzato per verificare che endDate sia maggiore o uguale a startDate
  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.parent?.get('startDate')?.value;
    const endDate = control.parent?.get('endDate')?.value;

    if (startDate && endDate && new Date(endDate) > new Date(startDate)) {
      return { dateRangeInvalid: 'End date must be greater than or equal to start date' };
    }
    return null; // Valido
  }

  // Carica le challenges
  loadChallenges() {
    this.isLoading = true;
    this.challengeService.getChallenges(this.itemsPerPage, this.currentPage, this.sortBy, this.order, this.startDate, this.endDate).subscribe({
      next: (response: any) => {
        this.challenges = response.challenges;
        this.totalPages = response.totalPages;
        if (!response.hasNextPage) {
          this.disableNext = true;
        } else {
          this.disableNext = false;
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.challenges = [];
        this.disableNext = true;
        this.isLoading = false;
      }
    });
  }

  // Va all'ultima pagina delle challenges
  goToLastPage() {
    if (this.totalPages) {
      this.currentPage = this.totalPages; 
      this.loadChallenges(); 
    }
  }

  // Preleva la data odierna
  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Preleva la data di due mesi prima
  getTwoMonthsAgoDate(): string {
    const today = new Date();
    today.setMonth(today.getMonth() - 2); //sottrae 2 mesi dalla data odierna
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Preleva la data e la imposta in formato DD-MM-YYYY
  getDayFromChallengeDate(date: Date): string {
    const parsedDate = new Date(date);
    const month = parsedDate.getMonth() + 1;
    return `${parsedDate.getDate().toString()}/${month.toString()}/${parsedDate.getFullYear().toString()}`;
  }

  // Va alla pagina seguente delle challenges
  nextPage() {
    if (!this.disableNext) {
      this.currentPage++;
      this.loadChallenges();
    }
  }

  // Va alla pagina precedente delle challenges
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadChallenges();
    }
  }

  // Aggiunge i filtri
  addFilters() {
    this.startDate = this.filter_Form.value.startDate as string;
    this.endDate = this.filter_Form.value.endDate as string;
    this.sortBy = this.filter_Form.value.sortBy as string;
    this.order = this.filter_Form.value.order as string;
    const isMobile = window.innerWidth <= 768; 
    if (isMobile) {
      this.filterStatus = !this.filterStatus; 
    } else {
      this.filterStatus = true; 
    }
    this.currentPage = 1;
    
    this.loadChallenges();
  }

  // Apre la barra dei filtri
  openFilters() {
      this.filterStatus = !this.filterStatus; 
  }   

  // Va alla galleria relativa alla challenge selezionata
  showMore(challenge_id: number){
    this.router.navigate([`/private/gallery/${challenge_id}`]);
  }
}
