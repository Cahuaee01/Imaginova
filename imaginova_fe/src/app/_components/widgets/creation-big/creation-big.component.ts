import { Component, Input, OnInit } from '@angular/core';
import { CreationItem } from '../../../_items/CreationType';
import { CommonModule } from '@angular/common';
import { CreationService } from '../../../_services/creation.service';
import { UserService } from '../../../_services/user.service';
import { config } from '../../../config/config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-creation-big',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './creation-big.component.html',
  styleUrl: './creation-big.component.scss'
})
export class CreationBigComponent implements OnInit{
  @Input() item!: CreationItem;
  isFullImageVisible: boolean = false;
  fullscreenImagePath: string = '';
  isLogged = false;

  constructor (private creationService: CreationService, private authService: UserService, private router: Router) {}

  ngOnInit() {
    this.authService.isLogged$.subscribe((logged) => {
      this.isLogged = logged;
    });
  }

  //preleva il path dell'immagine
  getImageSource(creation: CreationItem): string {
    const baseUrl = config.apiUrl;
    const formattedPath = creation.media_path?.replace(/\\/g, '/');
    return `${baseUrl}/${formattedPath}`;
  } 

  // Funzione per aprire l'immagine a schermo intero
  openImageFullScreen(): void {
    this.isFullImageVisible = true;
    this.fullscreenImagePath = this.getImageSource(this.item);
  }

  // Funzione per chiudere l'immagine a schermo intero
  closeImageFullScreen(): void {
    this.isFullImageVisible = false;
  }

  //preleva la data della creazione
  getDayFromCreationDate(date: Date): string {
    const parsedDate = new Date(date);
    const month = parsedDate.getMonth() + 1;
    return `${month.toString()}/${parsedDate.getDate().toString()}/${parsedDate.getFullYear().toString()}`;
  }  

  //funzione per mettere o togliere like o dislike
  setVote(creation: CreationItem, vote: string){
    this.creationService.setVote(creation.challenge, creation.creation_id as number, vote).subscribe({
      next: (data) => {
        creation.positiveVotes = data.positiveVotes;
        creation.negativeVotes = data.negativeVotes;
        creation.voteStatus = data.voteStatus;
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  } 

  showProfile(user_id: number): void {
    this.router.navigate([`/private/profile/${user_id}`]);
  }

  showMore(challenge_id: number){
    this.router.navigate([`/private/gallery/${challenge_id}`]);
  }
}
