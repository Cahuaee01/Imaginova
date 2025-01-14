import { Component, ViewChild } from '@angular/core';
import { DailyChallengeComponent } from '../../../widgets/daily-challenge/daily-challenge.component';
import { CreationComponent } from '../../../widgets/creation-small/creation.component';
import { CreationCarouselComponent } from '../../../widgets/creation-carousel/creation-carousel.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-private-homepage',
  standalone: true,
  imports: [DailyChallengeComponent, CreationComponent, CreationCarouselComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class PrivateHomepageComponent{
  @ViewChild(CreationCarouselComponent) creationCarousel!: CreationCarouselComponent;

  constructor(private router: Router) {}

  updateChallengeId(challengeId: number) {
    this.creationCarousel.challenge_id = challengeId;
    this.creationCarousel.currentPage = 1; //reset alla prima pagina
    this.creationCarousel.loadCreations();
  }

  callLoadCreations(){
    this.creationCarousel.loadCreations();
  }

  showMore(){
    this.router.navigate([`/private/gallery/${this.creationCarousel.challenge_id}`]);
  }

}
