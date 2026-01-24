import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolesService } from '../../../core/services/roles-service/roles-service';
import UserFull from '../../../core/models/actors/UserFull';
import Role from '../../../core/models/auth/Role';
import { HatoasPageResponse } from '../../../core/models/HatoasPageResponse';
import { UserService } from '../../../core/services/user-service/user-service';
import { RoleAssignation } from '../components/role-assignation/role-assignation';

@Component({
  selector: 'app-user-detail',
  imports: [RouterLink, ReactiveFormsModule, RoleAssignation],
  templateUrl: './user-info.html',
  styleUrl: './user-info.css',
})
export class UserInfo implements OnInit {

  // --- INJECTIONS ---
  private userService = inject(UserService);
  private roleService = inject(RolesService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // --- SIGNALS ---
  isRoleModalOpen = signal(false);
  availableRoles = signal<Role[]>([]);        // All the roles of the DBs (to the modal)
  currentUserRoles = signal<string[]>([]);    // IDS of user roles (to the checkboxes from modal)
  currentUserRolesObjects = signal<Role[]>([]);// Full objects (for show names in the cards)
  
  inputTypeDetected = signal<'EMAIL' | 'PHONE' | 'NAME' | 'UNKNOWN'>('UNKNOWN');

  // --- STATE ---
  userSelected: UserFull = {
    id: 0,
    firstName: 'Elliot',
    surname: 'Alderson',
    email: 'mr.robot@fsociety.dat',
    numberPhone: '+1 212-555-0100',
    createrAt: "2000-01-01",
    username: 'bonsoir_elliot',
  };

  users: UserFull[] = [];
  form!: FormGroup;

  // Pagination & Search
  isFindBy: boolean = false;
  userNotFound: boolean = false;
  pageSelected: number = 0;
  lastPage: number = 0;
  currentSearchTerm: string = '';
  numberOfPropertiesLoadInArray: number = 0;

  ngOnInit(): void {
    
    this.formInitilizer();
    this.loadUsers();

    // Detección automática del tipo de input
    this.form.get('inputToFind')?.valueChanges.subscribe((value) => {
      this.detectInputType(value);
    });

    // Cargar la lista maestra de roles una sola vez al inicio
    this.roleService.getRoles().subscribe({
      next: (roles) => this.availableRoles.set(roles),
      error: (err) => console.error('Error cargando roles maestros', err),
    });
  }

  // --- FORMULARIOS Y BÚSQUEDA ---

  formInitilizer() {
    this.form = this.fb.group({
      inputToFind: ['', [Validators.required, Validators.maxLength(200)]],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const inputValue = this.form.get('inputToFind')?.value;
    const type = this.inputTypeDetected();

    this.userNotFound = false;
    this.currentSearchTerm = inputValue;
    this.pageSelected = 0;

    if (type === 'NAME') {
      this.searchByName();
    } else if (type === 'EMAIL') {
      this.executeSearch(this.userService.getByEmail(inputValue));
    } else if (type === 'PHONE') {
      this.executeSearch(this.userService.getByPhone(inputValue));
    } else {
      if (inputValue.includes('@')) {
        this.executeSearch(this.userService.getByEmail(inputValue));
      } else {
        this.inputTypeDetected.set('NAME');
        this.searchByName();
      }
    }
  }

  detectInputType(value: string) {
    if (!value) { this.inputTypeDetected.set('UNKNOWN'); return; }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasNumbers = /\d/.test(value);

    if (emailPattern.test(value) || value.includes('@')) this.inputTypeDetected.set('EMAIL');
    else if (hasNumbers && value.length > 6) this.inputTypeDetected.set('PHONE');
    else if (value.trim().length >= 3) this.inputTypeDetected.set('NAME');
    else this.inputTypeDetected.set('UNKNOWN');
  }

  searchByName() {
    this.userService.getByName(this.currentSearchTerm, this.pageSelected).subscribe({
      next: (data: HatoasPageResponse<UserFull>) => {
        this.processHatoasResponse(data);
        this.isFindBy = true;
        if (!this.users || this.users.length === 0) {
          this.userNotFound = true;
          setTimeout(() => (this.userNotFound = false), 3000);
          this.loadUsers();
        }
      },
      error: (e) => console.log(e),
    });
  }

  executeSearch(observableRequest: any) {
    observableRequest.subscribe({
      next: (data: UserFull) => {
        this.users = [data];
        this.isFindBy = true;
        this.lastPage = 0;
        this.pageSelected = 0;
        this.userNotFound = false;
      },
      error: (e: any) => {
        if (e.status == 404) {
          this.userNotFound = true;
          setTimeout(() => (this.userNotFound = false), 3000);
        }
      },
    });
  }

  cleanFilter() {
    this.isFindBy = false;
    this.form.get('inputToFind')?.patchValue('');
    this.loadUsers();
  }

  // --- LÓGICA DE USUARIOS ---

  selectUser(user: UserFull) {
    this.userSelected = user;
    // CRUCIAL: Cargar los roles inmediatamente al seleccionar para verlos en la tarjeta
    this.reloadUserRoles(user.username);
  }

  // Helper centralizado para refrescar roles (se usa al seleccionar y al guardar)
  reloadUserRoles(username: string) {
    this.userService.getRolesByUsername(username).subscribe({
      next: (roles) => {
        // 1. Para la tarjeta visual (Chips con nombre)
        this.currentUserRolesObjects.set(roles);
        
        // 2. Para el modal (Checkboxes por ID)
        const roleIds = roles.map((r) => r.roleId);
        this.currentUserRoles.set(roleIds);
      },
      error: (e) => console.error('Error cargando roles del usuario', e),
    });
  }

  // --- LÓGICA DEL MODAL DE ROLES ---

  openRolesModal(user: UserFull) {
    // Solo abrimos, porque selectUser ya cargó los datos
    this.userSelected = user;
    this.isRoleModalOpen.set(true);
  }

  handleSaveRoles(newRoleIds: string[]) {
    const allRoles = this.availableRoles();

    // Construimos el DTO complejo que espera Java
    const roleDTOList = newRoleIds.map((id) => {
      const roleOriginal = allRoles.find((r) => r.roleId === id);
      return {
        roleId: Number(id), // Convertimos a número para Java
        roleName: roleOriginal ? roleOriginal.roleName : '',
      };
    });

    const payload = {
      roleDTOList: roleDTOList,
      userFullDTO: { ...this.userSelected }, // Copia del usuario
    };

    console.log('Enviando payload:', payload);

    this.roleService.assignRolesToUser(payload).subscribe({
      next: () => {
        console.log('Roles actualizados exitosamente');
        this.isRoleModalOpen.set(false);
        this.reloadUserRoles(this.userSelected.username); // Refrescar vista
      },
      error: (err) => console.error('Error guardando roles', err),
    });
  }

  deleteRoleFromCard(roleIdToDelete: string, roleName: string) {
    if (!confirm(`¿Quitar el rol "${roleName}" de ${this.userSelected.username}?`)) {
      return;
    }
    // Filtramos localmente y reutilizamos la lógica de guardado
    const currentIds = this.currentUserRoles();
    const newIds = currentIds.filter((id) => id !== roleIdToDelete);
    this.handleSaveRoles(newIds);
  }

  // --- PAGINACIÓN ---

  loadUsers() {
    this.userService.getAll(this.pageSelected).subscribe({
      next: (data: HatoasPageResponse<UserFull>) => {
        this.processHatoasResponse(data);
      },
      error: (e) => console.log(e),
    });
  }

  private processHatoasResponse(data: HatoasPageResponse<UserFull>) {
    const content = data?._embedded?.['userFullDTOList'] ?? []; // Asegúrate que el backend envía 'userFullDTOList'
    this.lastPage = (data.page?.totalPages ?? 0) - 1;
    this.pageSelected = data.page?.number ?? 0;
    this.users = content;
    this.numberOfPropertiesLoadInArray = this.users.length;
  }

  changePage(forward: boolean) {
    if (forward && this.pageSelected < this.lastPage) this.pageSelected++;
    else if (!forward && this.pageSelected > 0) this.pageSelected--;
    else return;

    if (this.isFindBy && this.inputTypeDetected() === 'NAME') this.searchByName();
    else this.loadUsers();
  }

  deleteUser(user: UserFull) {
    if (confirm(`¿Estás seguro de eliminar a ${user.username}?`)) {
      this.userService.delete(user).subscribe({
        next: () => this.loadUsers(),
        error: (e) => console.log(e),
      });
    }
  }
}