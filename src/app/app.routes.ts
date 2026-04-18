import { Routes } from '@angular/router';
import { adminGuardGuard } from './core/guards/admin-guard/admin-guard-guard';
import { FormProperty } from './features/admin/properties/create/create-property/form-property';
import { UserInfo } from './features/admin/user-info/user-info';
import { LogIn } from './features/pages/auth-pages/log-in/log-in';
import { Register } from './features/pages/auth-pages/register/register';
import { Home } from './features/pages/home-page/home';
import { Contact } from './features/pages/contact-page/contact';
import { AboutUs } from './features/pages/about-us-page/about-us';
import { Services } from './features/pages/services-page/services';
import { PropertyList } from './features/admin/properties/property-list/property-list';
import { DashboardPage } from './features/admin/dashboard/dashboard-page';
import { Admin } from './features/admin/main-admin-page/admin';
import { UserUpdate } from './features/pages/auth-pages/user-update/user-update';
import { UserProfile } from './features/pages/auth-pages/user-menu/user-profile/user-profile';
import { Properties } from './features/pages/public/properties/properties-page/properties';
import { PropertyDetail } from './features/pages/public/properties/property-detail/property-detail';
import { InquiryList } from './features/admin/inquiry-list/inquiry-list';
import { GeneralInquiryList } from './features/admin/general-inquiry-list/general-inquiry-list';

export const routes: Routes = [
  // ==========================================
  // 1. ZONA PÚBLICA (Cliente)
  // ==========================================
  { path: '', component: Home },
  { path: 'about-us', component: AboutUs },
  { path: 'contact', component: Contact },
  { path: 'services', component: Services },

  // Feature: Propiedades (Vista Cliente)
  { path: 'properties', component: Properties },
  { path: 'properties/:id', component: PropertyDetail }, // URL más limpia: /properties/123

  { path: 'login', component: LogIn, data: { hideShell: true } },
  { path: 'register', component: Register, data: { hideShell: true } },

  // ==========================================
  // 2. AUTH (Login / Registro)
  // ==========================================
  {
    path: 'auth',
    children: [
      { path: 'login', component: LogIn, data: { hideShell: true } },
      { path: 'register', component: Register, data: { hideShell: true } },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  // Mantenemos compatibilidad con tus links viejos si quieres,
  // o mejor actualiza tus <a routerLink> a '/auth/login'
  { path: 'log-in', redirectTo: 'auth/login', pathMatch: 'full' },

  // ==========================================
  // 3. ADMIN (Panel de Control - Sullivan Mor)
  // ==========================================
  {
    path: 'admin',
    component: Admin, // Este es tu Layout con Sidebar
    canActivate: [adminGuardGuard], // ¡Solo se pone AQUÍ una vez!
    children: [
      // Si entran a '/admin', los mandamos al dashboard automáticamente
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: DashboardPage },
      { path: 'consults', component: InquiryList },
      { path: 'contacts', component: GeneralInquiryList },

      // Sub-Feature: Gestión de Propiedades
      {
        path: 'properties',
        children: [
          { path: 'list', component: PropertyList }, // ruta: /admin/properties/list
          { path: 'create', component: FormProperty }, // ruta: /admin/properties/create
          { path: 'edit/:id', component: FormProperty }, // ruta: /admin/properties/edit/55
        ],
      },

      // Sub-Feature: Gestión de Usuarios
      {
        path: 'users',
        children: [
          { path: 'list', component: UserInfo }, // ruta: /admin/users/list
          { path: 'edit/:id', component: UserUpdate }, // ruta: /admin/users/edit/10
          { path: 'profile', component: UserProfile }, // ruta: /admin/users/edit/10
        ],
      },
    ],
  },

  // Rutas de desarrollo (Bórralas antes de salir a producción)
  // { path: 'test-roles', component: RoleAssignation },

  // Wildcard: Si escriben cualquier cosa rara, mandar al Home
  { path: '**', redirectTo: '' },
];
