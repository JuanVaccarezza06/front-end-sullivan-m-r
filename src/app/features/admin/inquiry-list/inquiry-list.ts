import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms'; // <--- IMPORTANTE
import { InquiryModel } from '../../../core/models/InquiryModel';
import { InquiryService } from '../../../core/services/inquiry-service/inquiry-service';
import { HatoasPageResponse } from '../../../core/models/HatoasPageResponse';
import Property from '../../../core/models/properties/Property';
import { ImgBbService } from '../../../core/services/imgbb-service/img-bb-service';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PropertyService } from '../../../core/services/property-service/property-service';
import State from '../../../core/models/State';
import { StateService } from '../../../core/services/state-service/state-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inquiry-list',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule], // <--- Agregamos ReactiveFormsModule
  templateUrl: './inquiry-list.html',
  styleUrl: './inquiry-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InquiryList implements OnInit, OnDestroy {
  private inquiryService = inject(InquiryService);
  private stateService = inject(StateService);
  private imgService = inject(ImgBbService);
  private propertyService = inject(PropertyService);

  // --- REACTIVE FORMS (La forma elegante) ---
  searchControl = new FormControl(''); // El control del input

  activeDropdownId = signal<number | null>(null);

  availableStates = signal<State[]>([]);

  private searchSubscription?: Subscription;

  // --- SEÑALES ---
  inquiries = signal<InquiryModel[]>([]);
  imageNotFound: string = '';

  // Paginación
  currentPage = signal<number>(0);
  totalPages = signal<number>(0);
  totalElements = signal<number>(0);

  private fetchSubscription?: Subscription;

  // Filtros (Mantenemos searchTerm como señal para la lógica de fetch)
  searchTerm = signal<string>('');
  selectedStateFilter = signal<string>('ALL');

  // --- COMPUTED ---
  isFirstPage = computed(() => this.currentPage() === 0);
  isLastPage = computed(() => this.currentPage() >= this.totalPages() - 1);

  ngOnInit(): void {
    this.imageNotFound = this.imgService.getNotFound();

    // 1. Cargar Estados del Backend
    this.fetchStates();

    // 1. Configurar el pipeline Reactivo
    this.searchSubscription = this.searchControl.valueChanges
      .pipe(
        debounceTime(500), // Espera a que el usuario deje de escribir
        distinctUntilChanged(), // Evita buscar lo mismo dos veces
      )
      .subscribe((value) => {
        // Actualizamos la señal y disparamos la búsqueda
        this.searchTerm.set(value || ''); // Manejo seguro de null
        this.currentPage.set(0); // Reset a página 1
        this.fetchInquiries();
      });

    // 2. Carga inicial
    this.fetchInquiries();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  // --- LÓGICA DE DATOS ---

  fetchInquiries() {
    // 1. CANCELACIÓN (Fix Race Condition)
    // Si hay una petición volando, la matamos antes de lanzar la nueva.
    if (this.fetchSubscription) {
      this.fetchSubscription.unsubscribe();
    }

    const page = this.currentPage();
    const term = this.searchTerm();
    const state = this.selectedStateFilter();

    console.log(`API CALL -> Pág: ${page}, Buscador: "${term}", Estado: ${state}`);

    let request$: Observable<HatoasPageResponse<InquiryModel>>;

    if (term.trim().length > 0 || state !== 'ALL') {
      request$ = this.inquiryService.search(term, state, page);
    } else {
      request$ = this.inquiryService.getAll(page);
    }

    // 2. ASIGNAMOS LA SUSCRIPCIÓN
    this.fetchSubscription = request$.subscribe({
      next: (response) => {
        const embeddedData = response._embedded ? Object.values(response._embedded)[0] : [];

        // TU LÓGICA (Perfecta)
        embeddedData.forEach((inquiry) => {
          if (inquiry.propertyDTO) {
            // Tip: Asegúrate de que processPropertyImages retorne el objeto con mainImageUrl
            // y que tu interfaz InquiryModel/PropertyDTO tenga esa propiedad opcional.
            inquiry.propertyDTO = this.propertyService.processPropertyImages(inquiry.propertyDTO);
          }
        });

        this.inquiries.set(embeddedData);
        this.totalPages.set(response.page.totalPages);
        this.totalElements.set(response.page.totalElements);
      },
      error: (err) => {
        console.error('Error fetching inquiries:', err);
        this.inquiries.set([]);
        this.totalElements.set(0);
      },
    });
  }

  fetchStates() {
    this.stateService.getStates().subscribe({
      next: (data) => {
        this.availableStates.set(data);
      },
      error: (err) => console.error('Error loading states:', err),
    });
  }

  // --- EVENTOS DEL DOM ---

  // Ya no necesitamos onSearch() manual, searchControl se encarga.

  onStateFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedStateFilter.set(select.value);
    this.currentPage.set(0);
    this.fetchInquiries();
  }

  onPageChange(delta: number) {
    const newPage = this.currentPage() + delta;
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.currentPage.set(newPage);
      this.fetchInquiries();
    }
  }

  // --- HELPERS ---
  getStateBadgeClass(stateName: string): string {
    switch (stateName?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'contestado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resuelto':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getCoverImage(p: Property): string {
    const images = p.imageDTOList;
    if (!images || images.length === 0) return this.imageNotFound;
    const sortedImages = images.slice().sort((a, b) => a.position - b.position);
    const primaryImg = sortedImages.find((img) => img.isPrimary);
    return primaryImg ? primaryImg.url : sortedImages[0].url;
  }

  // MÈTODO MEJORADO CON SWEETALERT
  viewInquiryDetails(inquiry: InquiryModel) {
    Swal.fire({
      // Título principal
      title: `Consulta de ${inquiry.user.firstName} ${inquiry.user.surname}`,

      // Icono animado (info, success, warning, error, question)
      icon: 'info',

      // HTML Customizado: Aquí inyectamos tu diseño
      html: `
        <div class="text-left space-y-2 mt-4">
          <p class="text-sm text-gray-600">
            <strong>Propiedad:</strong> <span class="text-gray-800">${inquiry.propertyDTO.title}</span>
          </p>
          <p class="text-sm text-gray-600">
            <strong>Email:</strong> <a href="mailto:${inquiry.user.email}" class="text-blue-600 hover:underline">${inquiry.user.email}</a>
          </p>
          <p class="text-sm text-gray-600">
            <strong>Teléfono:</strong> <a href="https://wa.me/${inquiry.user.numberPhone}" target="_blank" class="text-blue-600 hover:underline">${inquiry.user.numberPhone}</a>
          </p>
          
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-4">
            <p class="text-gray-700 italic text-sm">"${inquiry.description}"</p>
          </div>
        </div>
      `,

      // Configuración de botones
      showCloseButton: true, // La "X" arriba a la derecha
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#4F46E5', // Usamos tu color Indigo (Tailwind)
      focusConfirm: false, // Para que no se enfoque el botón solo

      // Clases de Tailwind para ajustar el ancho si quieres
      customClass: {
        popup: 'rounded-xl shadow-xl',
      },
    });
  }
  // Actualizamos la firma para recibir todo el objeto InquiryModel
  sendEmailToClient(inquiry: InquiryModel) {
    // 1. Depuración: Verificamos en consola que llegue el objeto
    console.log('Intentando enviar email a:', inquiry);

    if (!inquiry || !inquiry.user || !inquiry.user.email) {
      console.error('Faltan datos del usuario para enviar el correo');
      return;
    }

    const email = inquiry.user.email;

    // Usamos el operador ?. (optional chaining) por si propertyDTO viene null
    const tituloPropiedad = inquiry.propertyDTO?.title || 'la propiedad';
    const nombreUsuario = inquiry.user.firstName || 'Estimado/a';

    const subject = `Respuesta a su consulta sobre: ${tituloPropiedad}`;
    const body = `Hola ${nombreUsuario},\n\nRecibimos tu consulta sobre "${tituloPropiedad}" y queríamos comentarte que...\n\nSaludos,\nSullivan Mor Inmuebles`;

    // Codificamos los componentes de la URL
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Abrimos el cliente
    window.location.href = mailtoUrl;
  }
  sendWhatsApp(inquiry: InquiryModel) {
    const rawPhone = inquiry.user.numberPhone;

    if (!rawPhone) {
      console.error('El usuario no tiene teléfono');
      return;
    }

    // 1. SANITIZACIÓN: Quitamos todo lo que NO sea un número.
    // Ejemplo: "+54 9 (223) 123-456" se convierte en "549223123456"
    const cleanPhone = rawPhone.replace(/\D/g, '');

    // 2. Preparamos el mensaje personalizado
    const title = inquiry.propertyDTO?.title || 'la propiedad';
    const name = inquiry.user.firstName || 'Hola';

    // \n sirve para saltos de línea en WhatsApp
    const message = `Hola ${name}, te escribo de Sullivan Mor Inmuebles por tu consulta sobre: *${title}*.\n\n¿En qué horario te queda bien conversar?`;

    // 3. Generamos la URL de la API de WhatsApp
    // encodeURIComponent convierte los espacios y tildes a formato URL (%20, etc.)
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    // 4. Abrimos en una pestaña nueva (Recomendado para WhatsApp Web)
    window.open(whatsappUrl, '_blank');
  }

  onUpdateState(inquiry: InquiryModel, event: Event) {
    const selectElement = event.target as HTMLSelectElement;

    // Construimos el objeto State.
    // NOTA: Si tu backend requiere el ID del estado (ej: 1, 2, 3), aquí fallará.
    // Si tu backend busca por 'stateName', entonces esto funciona perfecto.
    const newState: State = { stateName: selectElement.value }; // Asumiendo que State tiene esa forma

    const oldStateName = inquiry.state.stateName;

    // Evitar llamadas innecesarias
    if (newState.stateName === oldStateName) return;

    // 1. OPTIMISTIC UPDATE (Corregido: Usamos inquiry.id)
    this.inquiries.update((currentList) =>
      currentList.map((item) =>
        item.id === inquiry.id // <--- FIX: Usar ID de la Inquiry, no de la Propiedad
          ? { ...item, state: { ...item.state, stateName: newState.stateName } }
          : item,
      ),
    );

    console.log(`Actualizando Inquiry ID ${inquiry.id} a: ${newState.stateName}`);

    // 2. LLAMADA AL BACKEND (Corregido: Usamos inquiry.id)
    this.inquiryService.updateState(inquiry.id, newState).subscribe({
      next: () => {
        // Éxito silencioso
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);

        // ROLLBACK (Corregido: Usamos inquiry.id)
        this.inquiries.update((currentList) =>
          currentList.map((item) =>
            item.id === inquiry.id
              ? { ...item, state: { ...item.state, stateName: oldStateName } }
              : item,
          ),
        );
        alert('Hubo un error al guardar el estado.');
      },
    });
  }

  // HELPER VISUAL 1: Colores del BADGE (Fondo y Texto)
  getStateColorClasses(stateName: string): string {
    switch (stateName?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
      case 'contactado':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case 'resuelto':
        return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
      case 'cancelado':
        return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'; // Ejemplo extra
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }
  }

  // HELPER VISUAL 2: Colores del PUNTITO (Dot) en el dropdown
  getStateDotColor(stateName: string): string {
    switch (stateName?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-400';
      case 'contactado':
        return 'bg-blue-400';
      case 'resuelto':
        return 'bg-green-400';
      case 'cancelado':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  }
  // HELPER VISUAL 3: Colores del TEXTO HOVER en el dropdown
  getStateHoverColor(stateName: string): string {
    switch (stateName?.toLowerCase()) {
      case 'pendiente':
        return 'hover:bg-yellow-50 hover:text-yellow-800';
      case 'contactado':
        return 'hover:bg-blue-50 hover:text-blue-800';
      case 'resuelto':
        return 'hover:bg-green-50 hover:text-green-800';
      case 'cancelado':
        return 'hover:bg-red-50 hover:text-red-800';
      default:
        return 'hover:bg-gray-50 hover:text-gray-900';
    }
  }

  // ACCIONES DEL DROPDOWN
  // --- ACCIONES VISUALES ---
  toggleDropdown(id: number, event: Event) {
    event.stopPropagation();
    if (this.activeDropdownId() === id) {
      this.activeDropdownId.set(null);
    } else {
      this.activeDropdownId.set(id);
    }
  }

  closeDropdown() {
    this.activeDropdownId.set(null);
  }

  selectState(inquiry: InquiryModel, newStateName: string) {
    this.closeDropdown();
    // Reutilizamos tu lógica de actualización existente
    const mockEvent = { target: { value: newStateName } } as unknown as Event;
    this.onUpdateState(inquiry, mockEvent);
  }
}
