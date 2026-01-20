import { Component, computed, effect, input, output, signal } from '@angular/core';
import Role from '../../../../core/models/auth/Role';

@Component({
  selector: 'app-role-assignation',
  imports: [],
  templateUrl: './role-assignation.html',
  styleUrl: './role-assignation.css'
})
export class RoleAssignation {
  
  // --- INPUTS ---
  isOpen = input.required<boolean>();
  allRoles = input.required<Role[]>();
  userCurrentRoleIds = input.required<string[]>();

  // --- OUTPUTS ---
  closeModal = output<void>();
  saveRoles = output<string[]>();

  // --- STATE ---
  searchTerm = signal('');
  tempSelectedRoleIds = signal<string[]>([]);

  constructor() {
    // Sincronizar estado cuando el modal se abre
    effect(() => {
      if (this.isOpen()) {
        this.searchTerm.set('');
        // Copia profunda de los IDs para edición temporal
        this.tempSelectedRoleIds.set([...this.userCurrentRoleIds()]);
      }
    });
  }

  // --- COMPUTED SIGNALS ---
  
  filteredRoles = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const roles = this.allRoles();
    if (!term) return roles;
    return roles.filter(r => r.roleName.toLowerCase().includes(term));
  });

  // Mapea los IDs seleccionados a Objetos Role (para mostrar en los chips del modal)
  selectedRolesObjects = computed(() => {
    const selectedIds = this.tempSelectedRoleIds();
    const roles = this.allRoles();
    return selectedIds
      .map(id => roles.find(r => r.roleId === id))
      .filter((r): r is Role => !!r);
  });

  hasChanges = computed(() => {
    const current = [...this.tempSelectedRoleIds()].sort().join(',');
    const original = [...this.userCurrentRoleIds()].sort().join(',');
    return current !== original;
  });

  // --- ACTIONS ---

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  toggleRole(roleId: string) {
    this.tempSelectedRoleIds.update(currentIds => {
      if (currentIds.includes(roleId)) {
        return currentIds.filter(id => id !== roleId);
      } else {
        return [...currentIds, roleId];
      }
    });
  }

  removeRole(roleId: string) {
    this.tempSelectedRoleIds.update(ids => ids.filter(id => id !== roleId));
  }

  onSave() {
    this.saveRoles.emit(this.tempSelectedRoleIds());
  }

  onClose() {
    if (this.hasChanges()) { 
      if (!confirm('Tienes cambios pendientes. ¿Cerrar sin guardar?')) return;
    }
    this.closeModal.emit();
  }
}