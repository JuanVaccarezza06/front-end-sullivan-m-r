import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../services/userService/user-service';
import UserFull from '../../../models/actors/UserFull';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HatoasPageResponse } from '../../../models/pagable/HatoasPageResponse';

@Component({
  selector: 'app-user-detail',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './user-info.html',
  styleUrl: './user-info.css',
})
export class UserInfo implements OnInit {
  userSelected: UserFull = {
    firstName: 'Elliot',
    surname: 'Alderson',
    email: 'mr.robot@fsociety.dat',
    numberPhone: '+1 212-555-0100',
    username: 'bonsoir_elliot',
  };

  users: UserFull[] = [];

  form!: FormGroup;

  isFindBy: boolean = false;
  userNotFound: boolean = false;

  numberPagesInDatabase: number = 0;
  numberOfPropertiesLoadInArray: number = 0;
  pageSelected: number = 0;
  lastPage: number = 0;

  // Para persistir el término de búsqueda al paginar
  currentSearchTerm: string = '';

  // 1. ACTUALIZAMOS EL TIPO DE LA SIGNAL
  inputTypeDetected = signal<'EMAIL' | 'PHONE' | 'NAME' | 'UNKNOWN'>('UNKNOWN');

  constructor(private userService: UserService, private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formInitilizer();
    this.loadUsers();

    // NUEVO: Escuchar cambios para feedback visual inmediato
    this.form.get('inputToFind')?.valueChanges.subscribe((value) => {
      this.detectInputType(value);
    });
  }

  formInitilizer() {
    this.form = this.fb.group({
      inputToFind: ['', [Validators.required, Validators.maxLength(200)]],
    });
  }

  // 2. NUEVA LÓGICA DE DETECCIÓN (Agregamos NAME)
  detectInputType(value: string) {
    if (!value) {
      this.inputTypeDetected.set('UNKNOWN');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    const hasNumbers = /\d/.test(value);

    if (emailPattern.test(value) || value.includes('@')) {
      this.inputTypeDetected.set('EMAIL');
    } else if (hasNumbers && value.length > 6) {
      this.inputTypeDetected.set('PHONE');
    } else if (value.trim().length >= 3) {
      // Si tiene más de 3 letras y no es email ni teléfono, es NOMBRE
      this.inputTypeDetected.set('NAME');
    } else {
      this.inputTypeDetected.set('UNKNOWN');
    }
  }

  // 3. NUEVO MÉTODO: BÚSQUEDA POR NOMBRE (HATEOAS)
  searchByName() {
    // Usamos currentSearchTerm para asegurar consistencia al paginar
    this.userService.getByName(this.currentSearchTerm, this.pageSelected).subscribe({
      next: (data: HatoasPageResponse<UserFull>) => {
        this.processHatoasResponse(data);
        this.isFindBy = true;
        console.log('Usuarios cargados (BY NAME):', this.users.length);

        // Feedback visual si no hay resultados en la lista
        if (!this.users || this.users.length === 0) {
          this.userNotFound = true;
          console.log('Lista vacía o indefinida');
          setTimeout(() => (this.userNotFound = false), 3000);
          this.loadUsers();
        }
      },
      error: (e) => console.log(e),
    });
  }

  private processHatoasResponse(data: HatoasPageResponse<UserFull>) {
    // CORRECCIÓN AQUÍ:
    // 1. data?.  -> ¿Existe data?
    // 2. _embedded?. -> ¿Existe _embedded? (Si la lista es vacía, esto es false)
    // 3. ['userFullDTOList'] -> ¿Existe la lista con ese nombre exacto?
    // 4. ?? [] -> Si CUALQUIERA de las anteriores falla, usa un array vacío.

    const content = data?._embedded?.['userDTOList'] ?? [];

    // El resto sigue igual
    const totalPages = data?.page?.totalPages ?? 0;
    const pageNum = data?.page?.number ?? 0;

    this.lastPage = totalPages - 1;
    this.pageSelected = pageNum;

    this.users = content;
    this.numberOfPropertiesLoadInArray = this.users.length;
  }

  // 4. CHANGE PAGE INTELIGENTE
  changePage(signal: boolean) {
    let newPage = this.pageSelected;

    // Calcular nueva página localmente primero
    if (signal && this.pageSelected < this.lastPage) {
      newPage++;
    } else if (!signal && this.pageSelected > 0) {
      newPage--;
    } else {
      return; // No hay cambio
    }

    this.pageSelected = newPage;

    // Decidir qué cargar
    if (this.isFindBy && this.inputTypeDetected() === 'NAME') {
      this.searchByName(); // Pagina sobre la búsqueda de nombre
    } else if (
      this.isFindBy &&
      (this.inputTypeDetected() === 'EMAIL' || this.inputTypeDetected() === 'PHONE')
    ) {
      // Email/Phone no suelen tener paginación real (es 1 resultado), pero si tuvieran, iría aquí.
      // Por ahora no hacemos nada o reseteamos.
    } else {
      this.loadUsers(); // Pagina sobre todos
    }
  }

  // user-info.ts

  loadUsers() {
    this.userService.getAll(this.pageSelected).subscribe({
      next: (data: HatoasPageResponse<UserFull>) => {
        // Usamos 'any' o HatoasPageResponse<UserFull>

        // 1. Extraer la lista de _embedded
        // Spring suele generar el nombre "userFullDTOList"
        const content = data._embedded['userFullDTOList'];

        // 2. Extraer info de paginación desde 'page'
        // Usamos el operador ?. por seguridad
        const totalPages = data.page?.totalPages ?? 0;
        const pageNum = data.page?.number ?? 0;

        // 3. Asignar variables
        this.lastPage = totalPages - 1;
        this.pageSelected = pageNum;
        this.users = content;
        this.numberOfPropertiesLoadInArray = this.users.length;

        console.log('Usuarios cargados vía HATEOAS:', this.users.length);
      },
      error: (e) => console.log(e),
    });
  }

  selectUser(user: UserFull) {
    this.userSelected = user;
  }

  updateUser(user: UserFull) {
    return this.router.navigate(['admin/user-update'], {
      state: { userToUpdate: user },
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const inputValue = this.form.get('inputToFind')?.value;
    const type = this.inputTypeDetected();

    this.userNotFound = false;
    this.currentSearchTerm = inputValue; // Guardamos el término actual
    this.pageSelected = 0; // Resetear a página 0 en nueva búsqueda

    if (type === 'NAME') {
      // Flujo HATEOAS (Lista)
      this.searchByName();
    } else if (type === 'EMAIL') {
      // Flujo Único
      this.executeSearch(this.userService.getByEmail(inputValue));
    } else if (type === 'PHONE') {
      // Flujo Único
      this.executeSearch(this.userService.getByPhone(inputValue));
    } else {
      // Fallback
      if (inputValue.includes('@')) {
        this.executeSearch(this.userService.getByEmail(inputValue));
      } else {
        // Intentamos nombre como último recurso si no parece email
        this.inputTypeDetected.set('NAME');
        this.searchByName();
      }
    }
  }

  // Helper para no repetir código en el subscribe
  executeSearch(observableRequest: any) {
    observableRequest.subscribe({
      next: (data: UserFull) => {
        this.users = [data]; // Array de 1 elemento
        this.isFindBy = true;
        this.lastPage = 0; // Búsqueda única no tiene páginas
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
    this.form.get('inputToFind')?.patchValue("");
    this.loadUsers();
  }

  deleteUser(user: UserFull) {
    if (confirm(`¿Estás seguro de eliminar a ${user.username}?`)) {
      this.userService.delete(user).subscribe({
        next: () => {
          console.log('Delete exitoso');
          // Si el usuario eliminado era el seleccionado, reseteamos selección o seleccionamos el primero
          if (this.userSelected.email === user.email && this.users.length > 0) {
            // Lógica opcional para resetear selección
          }
          this.loadUsers();
        },
        error: (e) => console.log(e),
      });
    }
  }

  openRolesModal(user: UserFull) {
    // Pendiente: Implementar lógica de apertura del modal de roles
    console.log('Abriendo modal de roles para:', user.username);
    this.userSelected = user;
    // Aquí iría la lógica para abrir el modal (ej: document.getElementById...)
  }
}
