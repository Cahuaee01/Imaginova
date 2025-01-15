import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreationService } from '../../../../_services/creation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-popup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './upload-popup.component.html',
  styleUrl: './upload-popup.component.scss'
})
export class UploadPopupComponent {
  @Input() isVisible: boolean = false;

  @Input() challengeId: number | undefined;

  @Input() userId: number = 0;

  @Output() closePopup = new EventEmitter<void>();
  @Output() alreadyParticipated = new EventEmitter<void>();

  errorMessage: string = '';
  successMessage: string = '';
  uploadStatus: 'success' | 'error' | null = null;

  upload_submitted = false;
  fileName: string = 'No file selected'; 
  selectedFile: File | null = null; 

  titleCharCount: number = 0; 
  descriptionCharCount: number = 0; 

  constructor(private creationService: CreationService) {}

  creation_Form = new FormGroup({
    creation_title: new FormControl('', [
      Validators.required,
      Validators.maxLength(64),
    ]),
    creation_description: new FormControl('', [
      Validators.maxLength(4096),
    ]),
  });

  creazione = {  
    title: '',  
    description: '',  
    imaginova_user:  0, 
    challenge: 0, 
    media_type: 0,  
    storage_type: 0  
  };  

  // Rende visibile o meno il popup ed emette l'evento al padre
  toggleUploadPopup(){
    this.isVisible = !this.isVisible;
    this.upload_submitted = false;
    this.selectedFile = null;
    this.fileName = 'No file selected';
    this.closePopup.emit();
  }

  // Gestione dell'inserimento del file e controllo che sia solo un'immagine
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files?.length) {
      const file = input.files[0];
      const fileType = file.type;
  
      // Controllo se il file è un'immagine
      if (fileType.startsWith('image/')) {
        this.fileName = file.name;
        this.selectedFile = file;
      } else {
        this.fileName = 'No valid image selected. Please choose an image file.';
        this.selectedFile = null;
        alert('Please select an image file!');
      }
    } else {
      this.fileName = 'No file selected';
      this.selectedFile = null;
    }
  }
  

  // Gestione del caricamento dei dati della creazione
  handleUpload() {
    this.upload_submitted = true;

    if (this.creation_Form.valid) {
      this.creazione.title = this.creation_Form.value.creation_title as string;
      this.creazione.description = this.creation_Form.value.creation_description as string;
      this.creazione.challenge = this.challengeId as number;

      const formData = new FormData();
      formData.append('title', this.creazione.title.toString()); 
      formData.append('description', this.creazione.description.toString());
      formData.append('imaginova_user', this.userId.toString()); 
      formData.append('media_type', this.creazione.media_type.toString()); 
      formData.append('storage_type', this.creazione.storage_type.toString()); 

      if (this.selectedFile) { 
        formData.append('file', this.selectedFile, this.selectedFile.name); 
      } 

      this.creationService.uploadCreation(formData, this.creazione.challenge).subscribe({
        next: () => {
          this.alreadyParticipated.emit();
          this.showSuccessMessage();
        },
        error: (err) => {
          console.error("Creation upload failed", err);
          this.showErrorMessage(err.error.message);
        },
      });
    } else {
      this.showErrorMessage("Invalid input.");
    }
  }

  // Gestione messaggi di successo o di errore
  showSuccessMessage() {
    this.uploadStatus = 'success';
    this.successMessage = `You have successfully uploaded your wonderful creation, Congrats!`;
  }

  showErrorMessage(errorMessage: string) {
    this.uploadStatus = 'error';
    this.errorMessage = errorMessage;
  }

  // Aggiornamento della lunghezza del titolo
  updateCharacterCount(): void {
    const titleControl = this.creation_Form.get('creation_title');
    this.titleCharCount = titleControl?.value?.length || 0;
  }

  // Aggiornamento della lunghezza della descrizione
  updateDescriptionCharacterCount(): void {
    const descriptionControl = this.creation_Form.get('creation_description');
    this.descriptionCharCount = descriptionControl?.value?.length || 0;
  }

  // Chiude il messaggio di errore e torna al form
  resetStatus(){
    this.uploadStatus = null;
  }

}
