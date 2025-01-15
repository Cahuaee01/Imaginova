import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgClass } from '@angular/common'; 
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { UserService } from '../../../_services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgClass, CommonModule, RouterLinkActive], 
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy{
  isLogged = false;
  user_id: number | undefined;
  private subscription: Subscription | null = null;

  constructor(private router: Router, private authService: UserService) {}

  ngOnInit(): void { // Verifica se l'utente è loggato
    this.subscription = this.authService.isLogged$.subscribe((logged) => {
      this.isLogged = logged; 
      this.user_id = Number(this.authService.getUser());
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe(); 
    }
  }

  // Logout
  handleLogout(): void {
    this.authService.logout();
    this.router.navigateByUrl("/public/homepage");
  }
}
