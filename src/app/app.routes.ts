import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Properties } from './pages/propertiesPages/properties/properties';
import { Contact } from './pages/contact/contact';
import { AboutUs } from './pages/viewPages/about-us/about-us';
import { Services } from './pages/viewPages/services/services';
import { Admin } from './pages/admistration/admin/admin';
import { adminGuardGuard } from './guards/adminGuards/admin-guard-guard';
import { FormPostProperty } from './components/forms/form-post-property/form-post-property';
import { PropertyList } from './pages/propertiesPages/property-list/property-list';
import { PropertyDetail } from './pages/propertiesPages/property-detail/property-detail';
import { UserInfo } from './pages/usersPages/user-info/user-info';
import { LogIn } from './pages/authPages/log-in/log-in';
import { Register } from './pages/authPages/register/register';
import { UserUpdate } from './pages/usersPages/user-update/user-update';
import { Dashboard } from './pages/admistration/dashboard/dashboard';
import { Consults } from './pages/admistration/consults/consults';

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
        canActivate: [adminGuardGuard],
        children: [
            {
                path: '',
                canActivate: [adminGuardGuard],
                component: FormPostProperty
            },
            {
                path: 'form-post',
                canActivate: [adminGuardGuard],
                component: FormPostProperty
            },

            {
                path: 'form-update',
                canActivate: [adminGuardGuard],
                component: FormPostProperty
            },
            {
                path: 'property-list',
                canActivate: [adminGuardGuard],
                component: PropertyList
            },
            {
                path: 'user-info',
                canActivate: [adminGuardGuard],
                component: UserInfo
            },
            {
                path: 'user-update',
                canActivate: [adminGuardGuard],
                component: UserUpdate
            },
            {
                path: 'dashboard',
                canActivate: [adminGuardGuard],
                component: Dashboard
            }
            ,
            {
                path: 'consults',
                canActivate: [adminGuardGuard],
                component: Consults
            }
        ]
    },
    { path: 'property-detail', component: PropertyDetail }



];
