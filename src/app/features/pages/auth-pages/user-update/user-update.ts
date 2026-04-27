import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../../core/services/user-service/user-service';
import { Router, RouterLink } from '@angular/router';
import UserFull from '../../../../core/models/actors/UserFull';
import { AuthService } from '../../../../core/services/auth-service/auth-service';

function noSQLInjection(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;
  const SQL_PATTERN = /(['";`]|--|SELECT|INSERT|UPDATE|DELETE|DROP|UNION|\/\*|\*\/|xp_)/i;
  if (SQL_PATTERN.test(value)) return { sqlInjection: true };
  return null;
}

function safeTextField(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;
  const SQL_PATTERN = /(['";`]|--|SELECT|INSERT|UPDATE|DELETE|DROP|UNION|\/\*|\*\/|xp_)/i;
  if (SQL_PATTERN.test(value)) return { sqlInjection: true };
  return null;
}

function safePassword(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;
  const isValid = /^[a-zA-Z0-9!@#$%^&*()\-_+=<>?{}[\]~]+$/.test(value);
  if (!isValid) return { unsafeChars: true };
  return null;
}

function safePhone(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;
  if (!/^\+?[0-9\s\-()]+$/.test(value)) return { unsafePhoneChars: true };
  return null;
}

// 1. Validador personalizado (Clean Architecture: fuera de la clase)
const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  if (!newPassword || !confirmPassword) return null;

  // Si coinciden, null (válido). Si no, error object.
  return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-user-update',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-update.html',
  styleUrl: './user-update.css',
})
export class UserUpdate implements OnInit {
  // Inyecciones modernas
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private authService = inject(AuthService);
  // Estado del usuario recuperado (Signal para reactividad)
  currentUser = signal<UserFull | null>(null);

  // Estado de la pestaña activa
  activeTab = signal<'personal' | 'password'>('personal');

  // Formularios
  personalForm!: FormGroup;
  passwordForm!: FormGroup;

  isSubmitting = signal<boolean>(false);

  // Computed: Iniciales basadas en firstName y surname del usuario real o del formulario
  userInitials = computed(() => {
    const user = this.currentUser();
    if (user?.firstName && user?.surname) {
      return (user.firstName[0] + user.surname[0]).toUpperCase();
    }
    return 'US';
  });

  ngOnInit(): void {
    // 1. Lógica de recuperación de datos (Router State)
    const state = this.router.lastSuccessfulNavigation?.extras?.state as {
      userToUpdate?: UserFull;
    };

    if (state?.userToUpdate) {
      this.currentUser.set(state.userToUpdate);
    } else {
      const usernameFromToken = this.authService.getUsername();

      if (usernameFromToken) {
        this.userService.getUserFullByUsername(usernameFromToken).subscribe({
          next: (user) => {
            this.currentUser.set(user);
            this.personalForm.patchValue(user);
          },
          error: (error) => {
            console.error('User para actualizar nulo', error);
          },
        });
      } else {
        console.error('User para actualizar nulo');
      }
    }

    // 2. Inicialización del Formulario Personal con validadores de seguridad
    this.personalForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), safeTextField, noSQLInjection]],
      surname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), safeTextField, noSQLInjection]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.minLength(6), Validators.maxLength(254), noSQLInjection],
      ],
      numberPhone: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          safePhone,
        ],
      ],
      username: [''],
    });

    // 2. Configuración del Formulario Password con Validador Grupal y requisitos fuertes
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=<>?{}[\]~]).+$/), safePassword, noSQLInjection]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator },
    );

    // 4. Patch de valores si existe el usuario
    if (this.currentUser()) {
      // Usamos patchValue para llenar lo que coincida (firstName, surname, email, numberPhone)
      this.personalForm.patchValue(this.currentUser()!);

      // Si el UserFull tiene username, lo asignamos manualmente si no coincide el nombre de la propiedad
      // this.personalForm.controls['username'].setValue(this.currentUser()!.username);
    }
  }

  switchTab(tab: 'personal' | 'password') {
    this.activeTab.set(tab);
  }

  // Lógica de Submit fusionada
  savePersonalData() {
    if (this.personalForm.valid && this.currentUser()) {
      const userFormValues = this.personalForm.value;
      const userEmail = this.currentUser()!.email; // El email original para la llamada (o del form si se permite cambiar)

      this.userService.update(userFormValues, userEmail).subscribe({
        next: (data) => {
          console.log('Update done', data);
          this.router.navigate(['/profile']);
        },
        error: (e) => {
          console.error('Error updating user', e);
          // Aquí podrías mostrar un toast/alerta de error
        },
      });
    } else {
      this.personalForm.markAllAsTouched(); // Mostrar errores si el form es inválido
    }
  }

  // Mantener la lógica de password separada (vacía por ahora o impleméntala si tienes servicio)
  updatePassword() {
    if (this.passwordForm.valid) {
      this.isSubmitting.set(true);

      const { currentPassword, newPassword } = this.passwordForm.value;

      this.userService.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.passwordForm.reset();

          alert('Contraseña actualizada. Por favor inicia sesión nuevamente.');

          // 1. Limpiamos el token y estado de sesión
          this.authService.logout();

          // 2. Redirigimos (el logout usualmente ya hace esto, pero por si acaso)
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          console.error('Error changing password', error);

          // Manejo específico del error 400 (Bad Request) que envía tu Backend
          if (error.status === 400) {
            // Asumimos que es "Password incorrecta" o "Nueva pass igual a la anterior"
            // Seteamos el error en el input para que aparezca en rojo
            this.passwordForm.get('currentPassword')?.setErrors({ invalidPassword: true });
          } else {
            alert('Ocurrió un error inesperado. Inténtalo más tarde.');
          }
        },
      });
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }
}
