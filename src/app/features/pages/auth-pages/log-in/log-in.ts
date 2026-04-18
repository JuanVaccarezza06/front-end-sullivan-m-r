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
import CredentialLogIn from '../../../../core/models/auth/CredentialLogIn';
import { AuthService } from '../../../../core/auth-service/auth-service';
import { StatusCard } from '../../../../shared/components/ui/status-card/status-card';

// ── Validadores personalizados ────────────────────────────────────────────────

/** Bloquea patrones clásicos de inyección SQL / NoSQL */
function noSQLInjection(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;

  const SQL_PATTERN =
    /(['";`]|--|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b|\bOR\b\s+\d|\bAND\b\s+\d|\/\*|\*\/|xp_)/i;

  return SQL_PATTERN.test(value) ? { sqlInjection: true } : null;
}

/** Solo letras, números y los símbolos habituales de un email/usuario */
function safeUsername(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;
  // Permite: a-z A-Z 0-9 @ . _ -
  return /^[a-zA-Z0-9@._\-]+$/.test(value) ? null : { unsafeChars: true };
}

/** Contraseña: solo permite especiales del set seguro (excluye ' " ; ` -- ) */
function safePassword(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;
  // Caracteres permitidos: letras, dígitos y !@#$%^&*()_\-+=<>?{}[]~
  return /^[a-zA-Z0-9!@#$%^&*()\-_+=<>?{}[\]~]+$/.test(value) ? null : { unsafeChars: true };
}

// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-log-in',
  imports: [ReactiveFormsModule, RouterLink, StatusCard],
  templateUrl: './log-in.html',
})
export class LogIn implements OnInit {
  formulario!: FormGroup;
  showPassword = false;

  loginLoading = false;

  statusMessage: string = '';
  statusType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
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
          Validators.maxLength(64),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=<>?{}[\]~]).+$/),
          safePassword,
          noSQLInjection,
        ],
      ],
      rememberMe: [false], // 👈 agrega el control al grupo
    });

    // Al iniciar, leer si hay usuario guardado
    this.cargarUsuarioRecordado();

    // Limpiar mensaje de estado al cambiar el formulario
    this.formulario.valueChanges.subscribe(() => {
      if (this.statusMessage) this.statusMessage = '';
    });
  }

  private cargarUsuarioRecordado(): void {
    const usuarioGuardado = localStorage.getItem('remembered_username');
    if (usuarioGuardado) {
      this.formulario.patchValue({
        username: usuarioGuardado,
        rememberMe: true,
      });
    }
  }

  get u() {
    return this.formulario.get('username')!;
  }
  get p() {
    return this.formulario.get('password')!;
  }

  onSumbit(): void {
    if (this.formulario.invalid) return;

    this.loginLoading = true;
    this.statusMessage = '';

    const { username, password, rememberMe } = this.formulario.value;

    // Guardar o limpiar según el estado del check
    if (rememberMe) {
      localStorage.setItem('remembered_username', username);
    } else {
      localStorage.removeItem('remembered_username');
    }

    const credential: CredentialLogIn = { username, password };

    this.authService.logIn(credential).subscribe({
      next: (data) => {
        this.loginLoading = false;
        if (data.token) {
          this.authService.saveToken(data.token);
          this.router.navigate([''], {
            queryParams: { msg: 'Usuario logeado correctamente.', type: 'success' },
          });
        }
      },
      error: (e) => {
        this.loginLoading = false;
        const message =
          e?.status === 401
            ? 'El usuario o la contraseña son incorrectos. Verificá tus datos.'
            : 'Ocurrió un error inesperado. Intentá de nuevo más tarde.';
        this.statusMessage = message;
        this.statusType = 'error';
      },
    });
  }

  autoLog(): void {
    const username = 'SoniaAdmin999';
    const password = '#123Secreto';
    const credential: CredentialLogIn = { username, password };

    this.loginLoading = true;
    this.statusMessage = '';

    this.authService.logIn(credential).subscribe({
      next: (data) => {
        this.loginLoading = false;
        if (data.token) {
          this.authService.saveToken(data.token);
          this.router.navigate([''], {
            queryParams: { msg: 'Usuario logeado correctamente.', type: 'success' },
          });
        }
      },
      error: (e) => {
        this.loginLoading = false;
        const message =
          e?.status === 401
            ? 'El usuario o la contraseña son incorrectos. Verificá tus datos.'
            : 'Ocurrió un error inesperado. Intentá de nuevo más tarde.';
        this.statusMessage = message;
        this.statusType = 'error';
      },
    });
  }
}
