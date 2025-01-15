import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, Validators, FormGroup, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../../../_services/user.service';
import { ThrobberComponent } from '../throbber/throbber.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, ThrobberComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent{
  activeSection: string = 'login'; 

  login_submitted = false;
  reset_submitted = false;

  status: 'success' | 'error' |  null = null;
  errorMessage: string = '';
  successMessage: string = '';
  successTitle: string = '';
  errorTitle: string = '';

  token: string = '';
  
  isLoading: boolean = false;

  // Regex come da backend per maggiore consistenza con la gestione degli errori
  static emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  static passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,16}$/;
  
  login_Form = new FormGroup({
    login_email: new FormControl('', [
      Validators.required,
      this.emailValidator
    ]),
    login_pass: new FormControl('', [
      Validators.required, 
      Validators.minLength(8), 
      Validators.maxLength(16),
      this.passwordValidator
    ])
  })

  // Validatori personalizzati per email, password
  emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return LoginComponent.emailRegex.test(control.value) ? null : { invalidEmail: true };
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return LoginComponent.passwordRegex.test(control.value) ? null : { invalidPassword: true };
  }

  reset_Form = new FormGroup({
    reset_email: new FormControl('', [Validators.required]),
  })

  constructor(private userService: UserService, private router: Router) {}

  // Gestione del login
  handleLogin(){
    this.login_submitted = true;
  
    if (this.login_Form.invalid) {
      this.showErrorMessage("Error during log in", "Please fill out all fields correctly.");
      return; 
    }
  
    this.userService.login(this.login_Form.value.login_email as string, this.login_Form.value.login_pass as string).subscribe({
      next: (data) => {
        this.userService.saveTokenAndUserId(data.token, data.user_id); 
        this.router.navigateByUrl("/private/homepage");
      },
      error: (err) => {
        console.error("Login failed", err);
  
        if (err.error && err.error.message) {
          this.showErrorMessage("Error during log in", err.error.message);
        } else {
          this.showErrorMessage("Error during log in", "An unexpected error occurred.");
        }
      },
    });
  }
  
  // Gestione della richiesta di reset della password
  handleReset() {
    this.reset_submitted = true;

    this.isLoading = true;
  
    this.userService.reset(this.reset_Form.value.reset_email as string).subscribe({
      next: () => {
        this.showSuccessMessage("Password reset requested", "You have succesfully requested your password reset, check your email.");
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Reset failed", err);

        this.isLoading = false;
  
        if (err.error && err.error.message) {
          this.showErrorMessage("Error during password reset request", err.error.message); 
        } else {
          this.showErrorMessage("Error during password reset request", "An unexpected error occurred."); 
        }
      },
    });
  }
  
  // Gestori viste
  showReset(){
    this.status = null;
  }

  setActiveSection(section: string) {
    this.activeSection = section;
    this.status = null;
  }

  // Gestori per i messaggi di errore o successo
  showSuccessMessage(successTitle: string, successMessage: string) {
    this.status = 'success';
    this.successMessage = successMessage;
    this.successTitle = successTitle;
  }

  showErrorMessage(errorTitle: string, errorMessage: string) {
    this.status = 'error';
    this.errorMessage = errorMessage;
    this.errorTitle = errorTitle;
  }
}
