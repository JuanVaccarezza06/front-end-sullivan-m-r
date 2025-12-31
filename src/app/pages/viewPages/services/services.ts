import { Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { ServiceModel } from '../../../models/service-models/ServiceModel';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-services',
  imports: [],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class Services {

  private services: ServiceModel[] = [
    {
      title: 'Venta de propiedades',
      description: 'Maximizamos el valor de tu propiedad con un plan de marketing personalizado y una estrategia de venta efectiva.',
      features: [
        'Valoración profesional de tu propiedad',
        'Reportaje fotográfico profesional',
        'Marketing digital y tradicional',
        'Gestión de visitas y negociaciones',
        'Asesoramiento legal y fiscal'
      ],
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
      messageDefault: `Hola, estoy interesado en vender mi propiedad. Me gustaría recibir una valoración profesional y conocer su plan de marketing para la venta.`
    },
    {
      title: 'Alquiler',
      description: 'Gestionamos el alquiler de tu propiedad o te ayudamos a encontrar el hogar perfecto para alquilar.',
      features: [
        'Selección rigurosa de inquilinos',
        'Redacción de contratos',
        'Gestión de fianzas y depósitos',
        'Mantenimiento y resolución de incidencias',
        'Renovaciones y actualizaciones de renta'
      ],
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
      messageDefault: `Hola, tengo una propiedad disponible y me gustaría información sobre su servicio de gestión de alquileres y selección de inquilinos.`

    },
    {
      title: 'Administración de propiedades',
      description: 'Delegá en nosotros la gestión operativa y administrativa de tu inmueble. Nos ocupamos del cuidado diario y las obligaciones.',
      features: [
        'Pago de impuestos, tasas y servicios',
        'Mantenimiento de jardines y espacios verdes',
        'Gestión y supervisión de reparaciones',
        'Control periódico del estado del inmueble',
        'Rendición de cuentas mensual detallada'
      ],
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>`,
      messageDefault: `Hola, quisiera delegar la administración operativa de mi inmueble en ustedes. Me interesa conocer el alcance del servicio y los costos de gestión.`

    },
    {
      title: 'Tasación',
      description: 'Realizamos valoraciones profesionales de propiedades para diversos fines: venta, herencia, hipoteca, etc.',
      features: [
        'Análisis detallado del inmueble',
        'Estudio de mercado de la zona',
        'Informe de valoración completo',
        'Certificado oficial de tasación',
        'Asesoramiento sobre mejoras'
      ],
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
      messageDefault: 'Hola, necesito realizar una tasación oficial de mi propiedad. Quisiera coordinar una visita para que evalúen el inmueble.'
    },
    {
      title: 'Asesoría legal',
      description: 'Ofrecemos asesoramiento legal especializado en todas las cuestiones relacionadas con el sector inmobiliario.',
      features: [
        'Revisión de contratos',
        'Asesoramiento fiscal',
        'Gestión de herencias y donaciones',
        'Resolución de conflictos',
        'Trámites ante notarías y registros'
      ],
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>`,
      messageDefault: 'Hola, requiero asesoramiento legal especializado en temas inmobiliarios. Me gustaría agendar una consulta con sus abogados.'
    },
    {
      title: 'Reformas y decoración',
      description: 'Contamos con un equipo de profesionales para realizar reformas y decoración de propiedades.',
      features: [
        'Proyectos de reforma integral',
        'Decoración de interiores',
        'Home staging para venta o alquiler',
        'Coordinación de gremios',
        'Supervisión de obras'
      ],
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
      messageDefault: 'Hola, estoy pensando en renovar mi propiedad. Me gustaría solicitar un presupuesto de reforma y ver sus propuestas de diseño.'
    }
  ];

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router // <--- Inyectar Router
  ) { }

  // Método helper para renderizar el SVG sin bloqueos de seguridad
  getSafeSvg(svgString: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  }

  getList() { return this.services }

  buildConsult(service: ServiceModel) {
    this.router.navigate(['/contact'], {
      queryParams: {
        subject: service.title,
        msg: service.messageDefault // Enviamos el mensaje predeterminado
      }
    });
  }

}
