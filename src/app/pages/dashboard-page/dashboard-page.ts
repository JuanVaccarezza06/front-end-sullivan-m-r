import { Component, inject, OnInit, signal } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Inquiry, Metric, TopProperty } from '../../models/dashboard.interfaces';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard-page',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit{
  private dashboardService = inject(DashboardService);

  // Estado reactivo con Signals
  metrics = signal<Metric[]>([]);
  topProperties = signal<TopProperty[]>([]);
  inquiries = signal<Inquiry[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data); // Debug
        this.metrics.set(data.metrics);
        this.topProperties.set(data.topProperties);
        this.inquiries.set(data.inquiries);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error conectando al backend:', err);
        this.isLoading.set(false);
      },
    });
  }

  // --- MÉTODOS DE AYUDA PARA LA VISTA (Reemplazan a ngClass) ---

  // 1. Para el color del texto (+12% vs -5%)
  getTrendColorClass(direction: string): string {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-slate-500'; // neutral
    }
  }

  // 2. Para el icono de la flecha
  getTrendIconClass(direction: string): string {
    switch (direction) {
      case 'up':
        return 'pi-arrow-up';
      case 'down':
        return 'pi-arrow-down';
      default:
        return 'pi-minus';
    }
  }

  // Lógica de colores para los iconos
  getIconClass(title: string): string {
    const base = 'pi text-2xl ';
    if (title.includes('Propiedades')) return base + 'pi-home text-blue-600';
    if (title.includes('Consultas')) return base + 'pi-inbox text-purple-600';
    if (title.includes('Vistas')) return base + 'pi-eye text-teal-600';
    if (title.includes('Usuarios')) return base + 'pi-users text-orange-600';
    return base + 'pi-info-circle text-gray-600';
  }

  getBgClass(title: string): string {
    if (title.includes('Propiedades')) return 'bg-blue-100';
    if (title.includes('Consultas')) return 'bg-purple-100';
    if (title.includes('Vistas')) return 'bg-teal-100';
    if (title.includes('Usuarios')) return 'bg-orange-100';
    return 'bg-gray-100';
  }
}
