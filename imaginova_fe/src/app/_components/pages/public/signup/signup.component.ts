import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators, FormGroup, FormControl, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../_services/user.service';
import { ThrobberComponent } from '../../../widgets/throbber/throbber.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, ThrobberComponent],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signup_submitted = false;
  registrationStatus: 'success' | 'error' | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(private router: Router, private registrationService: UserService) {}

  //regex come da backend per maggiore consistenza con la gestione degli errori
  static emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  static usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  static passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,16}$/;

  //validatori personalizzati per stampare il messaggio esatto
  emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return SignupComponent.emailRegex.test(control.value) ? null : { invalidEmail: true };
  }

  usernameValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return SignupComponent.usernameRegex.test(control.value) ? null : { invalidUsername: true };
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return SignupComponent.passwordRegex.test(control.value) ? null : { invalidPassword: true };
  }

  passwordMatchValidator(controlName1: string, controlName2: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get(controlName1)?.value;
      const confirmPassword = formGroup.get(controlName2)?.value;
  
      if (password !== confirmPassword) {
        formGroup.get(controlName2)?.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        formGroup.get(controlName2)?.setErrors(null);
        return null;
      }
    };
  }

  //form per la registrazione
  register_Form = new FormGroup(
    {
      register_email: new FormControl('', [
        Validators.required,
        this.emailValidator
      ]),
      register_username: new FormControl('', [
        Validators.required,
        this.usernameValidator
      ]),
      register_pass1: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(16),
        this.passwordValidator
      ]),
      register_pass2: new FormControl('', [Validators.required])
    },
    { validators: this.passwordMatchValidator('register_pass1', 'register_pass2') }
  );

  //gestione della registrazione utente
  handleRegister() {
    this.signup_submitted = true;
  
    if (this.register_Form.valid) {
      const userData = {
        usr: this.register_Form.value.register_username as string,
        email: this.register_Form.value.register_email as string,
        pwd1: this.register_Form.value.register_pass1 as string,
        pwd2: this.register_Form.value.register_pass2 as string
      };
  
      this.isLoading = true;

      this.registrationService.signup(userData).subscribe({
        next: () => {
          this.isLoading = false;
          this.showSuccessMessage();
        },
        error: (err) => {
          console.error("Registration failed", err);

          this.isLoading = false;
  
          if (err.error && err.error.message) {
            this.showErrorMessage(err.error.message); 
          } else {
              this.showErrorMessage("An unexpected error occurred."); 
          }
        }
      });
    } else {
      this.showErrorMessage("Credentials are not valid.");
    }
  }

  //gestori viste
  returnToSignup(){
    this.registrationStatus = null;
  }

  //gestori per i messaggi di errore o successo
  showSuccessMessage() {
    this.registrationStatus = 'success';
    this.successMessage = `You can now login with your new account, Congrats ${this.register_Form.value.register_username}!`;
  }

  showErrorMessage(errorMessage: string) {
    this.registrationStatus = 'error';
    this.errorMessage = errorMessage;
  }
}
