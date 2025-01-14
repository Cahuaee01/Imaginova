import { Component, OnInit } from '@angular/core';
import { ChallengeComponent } from '../../../widgets/challenge/challenge.component';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreationItem } from '../../../../_items/CreationType';
import { CreationService } from '../../../../_services/creation.service';
import { UserService } from '../../../../_services/user.service';
import { CreationComponent } from '../../../widgets/creation-small/creation.component';
import { CreationCarouselComponent } from '../../../widgets/creation-carousel/creation-carousel.component';

@Component({
  selector: 'app-challenge-display',
  standalone: true,
  imports: [ChallengeComponent, ReactiveFormsModule, CommonModule, CreationComponent, CreationCarouselComponent],
  templateUrl: './challenge.component.html',
  styleUrl: './challenge.component.scss'
})
export class ChallengeDisplayComponent implements OnInit{
  challenge_id: number | undefined;
  creations: CreationItem[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 6; //numero di elementi per pagina
  disableNext: boolean = false;
  sortBy: string = 'likes';
  order: string = 'desc';
  media: string = 'all';
  filterStatus: boolean = false;
  selectedCreationIndex: number = 0; // indice dell'elemento selezionato
  isFullCreationVisible: boolean = false;
  isFullscreenVisible: boolean = false;
  voteStatus: 'like' | 'dislike' | null = null;

  constructor (private route: ActivatedRoute, private creationService: CreationService, private authService: UserService) {}

  ngOnInit(): void {
     // Preleva l'id_challenge dalla route
     const idParam = this.route.snapshot.paramMap.get('challenge_id');
     this.challenge_id = idParam ? +idParam : undefined;

     this.filter_Form.patchValue({
      sortBy: 'likes',
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

  openFilters() {
      this.filterStatus = !this.filterStatus; 
  }  

}
