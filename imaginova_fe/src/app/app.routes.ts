import { Routes } from '@angular/router';
import { HomepageComponent } from './_components/pages/public/homepage/homepage.component';
import { AboutusComponent } from './_components/pages/public/aboutus/aboutus.component';
import { SignupComponent } from './_components/pages/public/signup/signup.component';
import { PasswordResetComponent } from './_components/pages/public/password-reset/password-reset.component';
import { PrivateHomepageComponent } from './_components/pages/private/homepage/homepage.component';
import { authGuard } from './_guards/auth.guard';
import { ChallengeGalleryComponent } from './_components/pages/private/gallery/challenge-gallery.component';
import { ChallengeDisplayComponent } from './_components/pages/private/challenge/challenge.component';
import { ProfileComponent } from './_components/pages/private/profile/profile.component';

export const routes: Routes = [
    {
        path: "public/homepage",
        component: HomepageComponent,
        title: "Imaginova | Login",
    },
    {
        path: "private/homepage",
        component: PrivateHomepageComponent,
        canActivate: [authGuard],
        title: "Imaginova | Homepage"
    },
    {
        path: "public/about-us",
        component: AboutusComponent,
        title: "Imaginova | About Us"
    },
    {
        path: "public/sign-up",
        component: SignupComponent,
        title: "Imaginova | Sign up"
    },
    {
        path: "public/password-reset",
        component: PasswordResetComponent,
        title: " Imaginova | Password Reset "
    },
    {
        path: "private/gallery",
        component: ChallengeGalleryComponent,
        canActivate: [authGuard],
        title: "Imaginova | Gallery"
    },
    {
        path: "private/gallery/:challenge_id",
        component: ChallengeDisplayComponent,
        canActivate: [authGuard],
        title: " Imaginova | Challenge"
    },
    {
        path: "private/profile/:user_id",
        component: ProfileComponent,
        canActivate: [authGuard],
        title: "Imaginova | Profile"
    },
    {
        path: "",
        redirectTo: "/public/homepage", //per ora
        pathMatch: 'full'
    },
    {
        path: "**",
        redirectTo: "/public/homepage" //per ora
    }
    
];
