import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { GeneralInquiryService } from '../../../core/services/general-inquiry-service/general-inquiry-service';
import GeneralInquiry from '../../../core/models/GeneralInquiry';
import { StateService } from '../../../core/services/state-service/state-service';
import State from '../../../core/models/State';

@Component({
  selector: 'app-general-inquiry-list',
  imports: [ReactiveFormsModule],
  templateUrl: './general-inquiry-list.html',
  styleUrl: './general-inquiry-list.css',
})
export class GeneralInquiryList {
private readonly service = inject(GeneralInquiryService);
  private readonly stateService = inject(StateService);

  // Signals de datos
  inquiries = signal<GeneralInquiry[]>([]);
  totalElements = signal<number>(0);
  loading = signal<boolean>(false);
  availableStates = signal<State[]>([]);

  // Filtros y Paginación
  searchControl = new FormControl('');
  stateFilter = signal<string>('ALL');
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  totalPages = signal<number>(0);

  // UI
  activeDropdownId = signal<number | null>(null);

  constructor() {
    // Listener del buscador
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        this.currentPage.set(0); // Reset página al buscar
        this.loadInquiries(term || '', this.stateFilter());
      });

    // Carga inicial
    this.loadStates();
    this.loadInquiries();
  }

  loadStates() {
    this.stateService.getStates().subscribe((states) => this.availableStates.set(states));
  }

  // --- ACCIONES DE CONTACTO ---

  sendEmail(inquiry: GeneralInquiry) {
    if (!inquiry.userDTO.email) return;

    const email = inquiry.userDTO.email;
    const name = inquiry.userDTO.firstName;
    const motive = inquiry.motiveDTO?.motiveName || 'Consulta General';

    // 1. Definimos Asunto y Cuerpo dinámicos
    const subject = `Respuesta a su consulta: ${motive}`;
    const body = `Hola ${name},\n\nRecibimos tu mensaje sobre "${motive}" y queríamos comentarte que...\n\nSaludos,\nSullivan Mor Inmuebles`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // 2. Método "Anti-Bloqueo" (Crea un link invisible y le hace click)
    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  sendWhatsApp(inquiry: GeneralInquiry) {
    const rawPhone = inquiry.userDTO.numberPhone;
    if (!rawPhone) return;

    // 1. Limpieza del número (Quitar paréntesis, guiones, espacios)
    let cleanPhone = rawPhone.replace(/\D/g, '');

    // Opcional: Si no empieza con 54, asumimos Argentina (Descomenta si lo necesitas)
    // if (!cleanPhone.startsWith('54')) cleanPhone = '549' + cleanPhone;

    const name = inquiry.userDTO.firstName;
    const motive = inquiry.motiveDTO?.motiveName || 'su consulta';
    
    // 2. Mensaje predefinido
    const message = `Hola ${name}, te escribo de Sullivan Mor Inmuebles respecto a tu mensaje sobre: *${motive}*.`;

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    // 3. Abrir en nueva pestaña
    window.open(whatsappUrl, '_blank');
  }

  loadInquiries(term: string = this.searchControl.value || '', state: string = this.stateFilter()) {
    this.loading.set(true);
    this.service.search(term, state, this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.inquiries.set(response.content);
        this.totalElements.set(response.total);
        this.totalPages.set(Math.ceil(response.total / this.pageSize()));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // --- ACCIONES DE UI ---

  // Nuevo método para el select de filtro
  onStateFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.stateFilter.set(select.value);
    this.currentPage.set(0);
    this.loadInquiries(this.searchControl.value || '', select.value);
  }

  toggleDropdown(id: number, event: Event) {
    event.stopPropagation();
    this.activeDropdownId.update(current => current === id ? null : id);
  }

  // Lógica principal de cambio de estado
  changeState(inquiry: GeneralInquiry, newState: State) {
    this.activeDropdownId.set(null); // Cerrar dropdown

    // Validación
    if (inquiry.stateDTO.stateName === newState.stateName) return;

    const oldState = inquiry.stateDTO;

    // OPTIMISTIC UPDATE (Corregido a stateDTO)
    this.inquiries.update((currentList) =>
      currentList.map((item) => {
        if (item.id === inquiry.id) {
          return { ...item, stateDTO: newState }; // <--- CLAVE DEL ARREGLO VISUAL
        }
        return item;
      })
    );

    // LLAMADA BACKEND
    this.service.updateState(inquiry.id, newState.stateName).subscribe({
      next: () => {}, // Éxito
      error: (err) => {
        console.error('Error updating state', err);
        // ROLLBACK
        this.inquiries.update((currentList) =>
          currentList.map((item) =>
            item.id === inquiry.id ? { ...item, stateDTO: oldState } : item
          )
        );
      }
    });
  }

  // Paginación
  changePage(delta: number) {
    const newPage = this.currentPage() + delta;
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.currentPage.set(newPage);
      this.loadInquiries();
    }
  }

  // --- HELPERS DE ESTILOS ---
  
  getStateBadgeStyles(stateName: string): string {
    const base = 'px-3 py-1 rounded-full text-xs font-semibold border ';
    switch (stateName?.toUpperCase()) {
      case 'NUEVO': return base + 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LEÍDO': return base + 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'RESPONDIDO': return base + 'bg-green-50 text-green-700 border-green-200';
      default: return base + 'bg-gray-50 text-gray-600 border-gray-200';
    }
  }

  getStateDotColor(stateName: string): string {
    switch (stateName?.toUpperCase()) {
      case 'NUEVO': return 'bg-blue-500';
      case 'LEÍDO': return 'bg-yellow-500';
      case 'RESPONDIDO': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  }

  getStateHoverColor(stateName: string): string {
    switch (stateName?.toUpperCase()) {
      case 'NUEVO': return 'hover:bg-blue-50 hover:text-blue-700';
      case 'LEÍDO': return 'hover:bg-yellow-50 hover:text-yellow-700';
      case 'RESPONDIDO': return 'hover:bg-green-50 hover:text-green-700';
      default: return 'hover:bg-gray-50';
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'
    });
  }
}