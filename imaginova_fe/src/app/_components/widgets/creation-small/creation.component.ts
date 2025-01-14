import { Component, Input, OnInit } from '@angular/core';
import { CreationItem } from '../../../_items/CreationType';
import { CommonModule } from '@angular/common';
import { config } from '../../../config/config';

@Component({
  selector: 'app-creation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './creation.component.html',
  styleUrl: './creation.component.scss'
})
export class CreationComponent implements OnInit{
  @Input() creationItem!: CreationItem;
  image_source: string | undefined;

  ngOnInit() {
    const baseUrl = config.apiUrl;
    const formattedPath = this.creationItem.media_path;
    this.image_source = formattedPath
      ? `${baseUrl}/${formattedPath}`
      : 'logo-small.svg';
  }   
}
