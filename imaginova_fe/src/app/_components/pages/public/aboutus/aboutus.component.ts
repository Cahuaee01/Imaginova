import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aboutus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aboutus.component.html',
  styleUrl: './aboutus.component.scss'
})
export class AboutusComponent {
  activeSection: string = 'about';  

  // Attiva la sezione cliccata
  setActiveSection(section: string) {
    this.activeSection = section;
  }
}
