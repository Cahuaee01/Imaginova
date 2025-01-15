import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../_services/user.service';
import { ThrobberComponent } from '../../../widgets/throbber/throbber.component';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, ThrobberComponent],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent implements OnInit{
  static passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,16}$/;
   
  reset_submitted = false;

  resetStatus: 'success' | 'error' | null = null;
  errorMessage: string = '';
  successMessage: string = '';

  email: string = '';
  otp: string = '';
  password: string = '';

  isLoading: boolean = false;

  new_password_Form = new FormGroup(
    {
      reset_password1: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(16),
        this.passwordValidator
      ]),
      reset_password2: new FormControl('', [Validators.required])
    },
    { validators: this.passwordMatchValidator('reset_password1', 'reset_password2') }
  );

  constructor(private route: ActivatedRoute, private resetPasswordService: UserService) {}

  // Esempio: http://localhost:4200/password-reset?otp=123456
  ngOnInit(): void {
    // Prelevo l'otp dai query param
    this.route.queryParams.subscribe((params) => {
      const otp = params['otp'];
    
      if (otp) {
        this.otp = otp;
        
        // Verifico otp e prelevo email relativa all'otp
        this.resetPasswordService.verifyOtp(this.otp).subscribe({
          next: (data) => {
            this.email = data.email;
          },
          error: (err) => {
            console.error('Reset failed', err);
            if (err.error && err.error.message) {
              this.showErrorMessage(err.error.message);
            } else {
              this.showErrorMessage('An unexpected error occurred.');
            }
          },
        });
      }
    });
  }

  // Cambio della password
  handlePasswordReset() {
    this.reset_submitted = true;

    if (this.new_password_Form.valid) {
        this.password = this.new_password_Form.value.reset_password1 as string;
        this.isLoading = true;

        this.resetPasswordService.changePassword(this.email, this.password, this.otp).subscribe({
            next: () => {
                this.showSuccessMessage();
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Reset failed", err);
                this.isLoading = false;
                if (err.error && err.error.message) {
                    this.showErrorMessage(err.error.message);
                } else {
                    this.showErrorMessage("An unexpected error occurred.");
                }
            },
        });
    } else {
        this.showErrorMessage("Form is invalid. Please check your input.");
    }
  }

  // Validatori per la password
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return PasswordResetComponent.passwordRegex.test(control.value) ? null : { invalidPassword: true };
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
  
  // Gestori viste
  showReset(){
    this.resetStatus = null;
  }

  // Gestori per i messaggi di errore o successo
  showSuccessMessage() {
    this.resetStatus = 'success';
    this.successMessage = `You have succesfully reset your password`;
  }

  showErrorMessage(errorMessage: string) {
    this.resetStatus = 'error';
    this.errorMessage = errorMessage;
  }
}
