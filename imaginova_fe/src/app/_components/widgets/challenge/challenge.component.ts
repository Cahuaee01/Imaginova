import { Component, Input, OnInit } from '@angular/core';
import { ChallengeService } from '../../../_services/challenge.service';
import { ChallengeItem } from '../../../_items/ChallengeType';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-challenge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './challenge.component.html',
  styleUrl: './challenge.component.scss'
})
export class ChallengeComponent implements OnInit{
  @Input() challenge_id: number | undefined;
  @Input() insideProfile: boolean | undefined;
  challenge: ChallengeItem = {} as ChallengeItem;

  ngOnInit(): void {
    this.loadChallenge();
  }

  constructor (private challengeService: ChallengeService, private router: Router) {}

  loadChallenge(){
    this.challengeService.getChallenge(this.challenge_id as number).subscribe({
      next: (data) => {
        this.challenge = data.challenge as ChallengeItem; 
      },
      error: (err: any) => {
        this.challenge.description = err.error.message;
        console.log(err);
      }
    });
  }

  getDayFromChallengeDate(date: Date): string {
    const parsedDate = new Date(date);
    const month = parsedDate.getMonth() + 1;
    return `${month.toString()}/${parsedDate.getDate().toString()}/${parsedDate.getFullYear().toString()}`;
  } 
  
  showMore(){
    this.router.navigate([`/private/gallery/${this.challenge_id}`]);
  }
}
