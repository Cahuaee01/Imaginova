import { Component, ViewChild } from '@angular/core';
import { DailyChallengeComponent } from '../../../widgets/daily-challenge/daily-challenge.component';
import { CreationCarouselComponent } from '../../../widgets/creation-carousel/creation-carousel.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-private-homepage',
  standalone: true,
  imports: [DailyChallengeComponent, CreationCarouselComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class PrivateHomepageComponent{
  @ViewChild(CreationCarouselComponent) creationCarousel!: CreationCarouselComponent;

  constructor(private router: Router) {}

  // Quando la challenge giornaliera cambia (alle 12) ricarica le creazioni della homepage
  updateChallengeId(challengeId: number) {
    this.creationCarousel.challenge_id = challengeId;
    this.creationCarousel.currentPage = 1; //reset alla prima pagina
    this.creationCarousel.loadCreations();
  }

  // Quando c'è bisogno di ricaricare le creazioni
  callLoadCreations(){
    this.creationCarousel.loadCreations();
  }

  // Va alla galleria relativa alla challenge giornaliera
  showMore(){
    this.router.navigate([`/private/gallery/${this.creationCarousel.challenge_id}`]);
  }

}
