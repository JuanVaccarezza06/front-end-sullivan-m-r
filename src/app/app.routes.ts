import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Properties } from './pages/properties/properties';
import { Contact } from './pages/contact/contact';
import { AboutUs } from './pages/about-us/about-us';
import { AutenticationForm } from './pages/autentication-form/autentication-form';
import { Services } from './pages/services/services';
import { LogIn } from './pages/log-in/log-in';
import { Register } from './pages/register/register';

export const routes: Routes = [
    
    {path : '', component : Home},
    {path : 'properties', component : Properties},
    {path : 'contact', component : Contact},
    {path : 'about-us', component : AboutUs},
    {path : 'services', component : Services},
    {path : 'log-in', component : LogIn},
    {path : 'register', component : Register}


];
