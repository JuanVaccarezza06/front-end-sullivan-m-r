import { Routes } from '@angular/router';
import { Properties } from './features/pages/auth-pages/public/properties/properties-page/properties';
import { adminGuardGuard } from './core/guards/admin-guard/admin-guard-guard';
import { FormPostProperty } from './features/admin/properties/create/create-property/form-post-property';
import { PropertyDetail } from './features/pages/auth-pages/public/properties/property-detail/property-detail';
import { UserInfo } from './features/admin/user-info/user-info';
import { LogIn } from './features/pages/auth-pages/log-in/log-in';
import { Register } from './features/pages/auth-pages/register/register';
import { Consults } from './features/admin/consults/consults';
import { Home } from './features/pages/home-page/home';
import { Contact } from './features/pages/contact-page/contact';
import { AboutUs } from './features/pages/about-us-page/about-us';
import { Services } from './features/pages/services-page/services';
import { PropertyList } from './features/admin/properties/property-list/property-list';
import { DashboardPage } from './features/admin/dashboard/dashboard-page';
import { Admin } from './features/admin/main-admin-page/admin';
import { RoleAssignation } from './features/admin/components/role-assignation/role-assignation';
import { UserUpdate } from './features/pages/auth-pages/user-update/user-update';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'properties', component: Properties },
  { path: 'contact', component: Contact },
  { path: 'about-us', component: AboutUs },
  { path: 'services', component: Services },
  { path: 'log-in', component: LogIn },
  { path: 'register', component: Register },
  { path: 'property-detail/:id', component: PropertyDetail },
  { path: 'prueba', component: RoleAssignation },
  {
    path: 'admin',
    component: Admin, // Este es tu componente "layout" con el sidebar
    canActivate: [adminGuardGuard],
    children: [
      {
        path: '',
        canActivate: [adminGuardGuard],
        component: FormPostProperty,
      },
      {
        path: 'form-post',
        canActivate: [adminGuardGuard],
        component: FormPostProperty,
      },

      {
        path: 'form-update',
        canActivate: [adminGuardGuard],
        component: FormPostProperty,
      },
      {
        path: 'property-list',
        canActivate: [adminGuardGuard],
        component: PropertyList,
      },
      {
        path: 'user-info',
        canActivate: [adminGuardGuard],
        component: UserInfo,
      },
      {
        path: 'user-update',
        canActivate: [adminGuardGuard],
        component: UserUpdate,
      },
      {
        path: 'consults',
        canActivate: [adminGuardGuard],
        component: Consults,
      },
      {
        path: 'dashboard',
        canActivate: [adminGuardGuard],
        component: DashboardPage,
      }
    ],
  },
];
