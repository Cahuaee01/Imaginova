import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyChallengeComponent } from '../../../widgets/daily-challenge/daily-challenge.component';
import { LoginComponent } from '../../../widgets/login/login.component';
import { UserService } from '../../../../_services/user.service';
import { Router } from '@angular/router';
import { CreationCarouselComponent } from '../../../widgets/creation-carousel/creation-carousel.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [DailyChallengeComponent, LoginComponent, CommonModule, CreationCarouselComponent],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  isLogged = false;

  constructor(private authService: UserService, private router: Router) {}

  ngOnInit(): void {
    // Verifica se l'utente è loggato o meno
    this.authService.isLogged$.subscribe((logged) => {
      this.isLogged = logged;
  
      if (!this.isLogged) { // Se non è loggato lo rimanda alla pagina homepage pubblica
        this.router.navigateByUrl('/public/homepage');
      }
    });
  }  

  // Carosello
  @ViewChild(CreationCarouselComponent) creationCarousel!: CreationCarouselComponent;
  
    updateChallengeId(challengeId: number) {
      this.creationCarousel.challenge_id = challengeId;
      this.creationCarousel.currentPage = 1; //reset alla prima pagina
      this.creationCarousel.loadCreations();
    }
  
    callLoadCreations(){
      this.creationCarousel.loadCreations();
    }
}
