import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import CredentialRegister from '../../../../core/models/auth/CredentialRegister';
import { StatusCard } from '../../../../shared/components/ui/status-card/status-card';
import { AuthService } from '../../../../core/services/auth-service/auth-service';

// ── Validadores personalizados ────────────────────────────────────────────────

/** Bloquea patrones clásicos de inyección SQL / NoSQL */
function noSQLInjection(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;

  const SQL_PATTERN =
    /(['";`]|--|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b|\bOR\b\s+\d|\bAND\b\s+\d|\/\*|\*\/|xp_)/i;

  if (SQL_PATTERN.test(value)) {
    console.warn(`[Validación SQL Injection] Campo contiene patrón sospechoso: "${value}"`);
    return { sqlInjection: true };
  }
  return null;
}

/** Solo letras, números y los símbolos habituales de un email/usuario */
function safeUsername(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;
  // Permite: a-z A-Z 0-9 @ . _ -
  const isValid = /^[a-zA-Z0-9@._\-]+$/.test(value);
  if (!isValid) {
    console.warn(
      `[Validación Username] Caracteres no permitidos en "${value}". Solo alfanuméricos, @, ., _, -`,
    );
    return { unsafeChars: true };
  }
  return null;
}

/** Contraseña: solo permite especiales del set seguro (excluye ' " ; ` -- ) */
function safePassword(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;
  // Caracteres permitidos: letras, dígitos y !@#$%^&*()_\-+=<>?{}[]~
  const isValid = /^[a-zA-Z0-9!@#$%^&*()\-_+=<>?{}[\]~]+$/.test(value);
  if (!isValid) {
    console.warn(
      `[Validación Password] Caracteres no permitidos en contraseña. Solo alfanuméricos y !@#$%^&*()_-+=<>?{}[]~`,
    );
    return { unsafeChars: true };
  }
  return null;
}

/** Valida email con límite de longitud */
function safeEmail(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;

  // Detectar patrones de SQL injection en email
  const SQL_PATTERN =
    /(['";`]|--|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b|\/\*|\*\/|xp_)/i;

  if (SQL_PATTERN.test(value)) {
    console.warn(`[Validación Email SQL Injection] Email contiene patrón sospechoso: "${value}"`);
    return { sqlInjection: true };
  }
  return null;
}

/** Valida campo de texto (evita inyecciones) */
function safeTextField(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;

  // Detectar inyección SQL básica
  if (value.length > 200) {
    console.warn(`[Validación Longitud] Campo excede 200 caracteres: ${value.length}`);
    return { maxLength200: true };
  }

  const SQL_PATTERN =
    /(['";`]|--|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b|\/\*|\*\/|xp_)/i;

  if (SQL_PATTERN.test(value)) {
    console.warn(`[Validación SQL Injection] Campo contiene patrón sospechoso: "${value}"`);
    return { sqlInjection: true };
  }
  return null;
}

/** Válida teléfono (solo números, espacios, +, -) */
function safePhone(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;

  if (!/^\+?[0-9\s\-()]+$/.test(value)) {
    console.warn(
      `[Validación Teléfono] Caracteres no permitidos. Solo números, espacios, +, -, ()`,
    );
    return { unsafePhoneChars: true };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, StatusCard],
  templateUrl: './register.html',
})
export class Register implements OnInit {
  formulario!: FormGroup;
  showPassword = false;
  credential!: CredentialRegister;

  /** Mensajes comerciales: solo para StatusCard */
  statusMessage: string | null = null;
  statusType: 'success' | 'error' = 'success';
  registerLoading = false;

  constructor(
    private fb: FormBuilder,
    private service: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          safeTextField,
        ],
      ],
      surname: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          safeTextField,
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.minLength(6),
          Validators.maxLength(254),
          safeEmail,
        ],
      ],
      numberPhone: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(20),
          safePhone,
        ],
      ],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(30),
          safeUsername,
          noSQLInjection,
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(30),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=<>?{}[\]~]).+$/),
          safePassword,
          noSQLInjection,
        ],
      ],
    });

    // Listener para validación en tiempo real
    this.formulario.valueChanges.subscribe(() => {
      if (this.statusMessage) {
        this.statusMessage = null;
      }
    });
  }

  // ── Getters para acceso a controles ────────────────────────────────────────

  get fn() {
    return this.formulario.get('firstName')!;
  }
  get sn() {
    return this.formulario.get('surname')!;
  }
  get em() {
    return this.formulario.get('email')!;
  }
  get ph() {
    return this.formulario.get('numberPhone')!;
  }
  get us() {
    return this.formulario.get('username')!;
  }
  get pw() {
    return this.formulario.get('password')!;
  }

  // ── Métodos de validación y logging ────────────────────────────────────────

  private logFieldError(fieldName: string, errors: ValidationErrors | null): void {
    if (!errors) return;

    const errorKeys = Object.keys(errors);
    errorKeys.forEach((key) => {
      switch (key) {
        case 'required':
          console.log(`[Validación ${fieldName}] Campo obligatorio no completado`);
          break;
        case 'minlength':
          const minLen = errors['minlength']?.requiredLength;
          console.log(
            `[Validación ${fieldName}] Mínimo ${minLen} caracteres. Actual: ${errors['minlength'].actualLength}`,
          );
          break;
        case 'maxlength':
          const maxLen = errors['maxlength']?.requiredLength;
          console.log(
            `[Validación ${fieldName}] Máximo ${maxLen} caracteres. Actual: ${errors['maxlength'].actualLength}`,
          );
          break;
        case 'email':
          console.log(`[Validación ${fieldName}] Formato de email inválido`);
          break;
        case 'pattern':
          console.log(
            `[Validación ${fieldName}] No cumple el patrón requerido (ej: mayúscula, número, símbolo)`,
          );
          break;
        case 'sqlInjection':
          console.warn(`[SEGURIDAD ${fieldName}] Patrón de inyección SQL detectado`);
          break;
        case 'unsafeChars':
          console.warn(`[SEGURIDAD ${fieldName}] Caracteres no permitidos detectados`);
          break;
        case 'unsafePhoneChars':
          console.warn(`[SEGURIDAD ${fieldName}] Caracteres no permitidos en teléfono`);
          break;
        case 'maxLength200':
          console.warn(`[SEGURIDAD ${fieldName}] Excede 200 caracteres`);
          break;
        default:
          console.log(`[Validación ${fieldName}] Error: ${key}`);
      }
    });
  }

  onSumbit(): void {
    if (this.formulario.invalid) {
      // Logging técnico: registrar TODOS los errores de validación
      console.group('[REGISTRO] Errores de validación detectados');
      Object.keys(this.formulario.controls).forEach((fieldName) => {
        const control = this.formulario.get(fieldName);
        if (control?.invalid && control?.touched) {
          this.logFieldError(fieldName, control.errors);
        }
      });
      console.groupEnd();
      return;
    }

    this.registerLoading = true;
    this.statusMessage = null;

    this.credential = this.formulario.value;

    console.log('[REGISTRO] Iniciando registro con datos:', {
      firstName: this.credential.firstName,
      surname: this.credential.surname,
      email: this.credential.email,
      username: this.credential.username,
    });

    this.service.register(this.credential).subscribe({
      next: (data) => {
        this.registerLoading = false;
        const token = data.token;
        if (token) {
          this.service.saveToken(token);
          console.log('[REGISTRO] ✓ Token almacenado correctamente');

          this.router.navigate([''], {
            queryParams: {
              msg: 'Usuario registrado correctamente.',
              type: 'success',
            },
          });
        }
      },
      error: (e) => {
        this.registerLoading = false;
        console.error('[REGISTRO] Error en registro:', e);

        // Mensaje comercial
        const message =
          e?.status === 409
            ? 'El usuario o email ya están registrados.'
            : 'Ocurrió un error inesperado. Intentá de nuevo más tarde.';

        this.statusMessage = message;
        this.statusType = 'error';

        console.log(`[REGISTRO] Mostrando StatusCard con mensaje: "${message}"`);
      },
    });
  }
}



