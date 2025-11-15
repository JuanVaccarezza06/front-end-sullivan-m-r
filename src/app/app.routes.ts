import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Properties } from './pages/properties/properties';
import { Contact } from './pages/contact/contact';
import { AboutUs } from './pages/about-us/about-us';
import { Services } from './pages/services/services';
import { LogIn } from './pages/log-in/log-in';
import { Register } from './pages/register/register';
import { Admin } from './pages/admin/admin';
import { adminGuardGuard } from './guards/adminGuards/admin-guard-guard';
import { FormPostProperty } from './components/forms/form-post-property/form-post-property';

export const routes: Routes = [

    { path: '', component: Home },
    { path: 'properties', component: Properties },
    { path: 'contact', component: Contact },
    { path: 'about-us', component: AboutUs },
    { path: 'services', component: Services },
    { path: 'log-in', component: LogIn },
    { path: 'register', component: Register },
    {
        path: 'admin',
        component: Admin, // Este es tu componente "layout" con el sidebar
        canActivate: [adminGuardGuard], // El guard protege al padre y a todos sus hijos

    }


];
