import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GenericItem } from '../../models/property/complements/GenericItem';

@Component({
  selector: 'app-table-configuration',
  imports: [],
  templateUrl: './table-configuration.html',
  styleUrl: './table-configuration.css'
})
export class TableConfiguration {

  @Input() items: GenericItem[] = [];

  @Output() onDelete = new EventEmitter<GenericItem>();

  @Output() showError = new EventEmitter<string>();

  // table-configuration.component.ts
  @Output() onSee = new EventEmitter<GenericItem>();

  // Almacena solo los ítems que han sido modificados
  public featuredToUpdate: GenericItem[] = [];

  addIntoFeaturedArray(item: GenericItem, event: Event): void {

    const toggle = event.target as HTMLInputElement; // <--- CORRECCIÓN AQUÍ

    // 1. Verificamos si estamos intentando APAGARLO (unchecked)
    // Si input.checked es false, significa que el usuario acaba de desmarcarlo.
    if (!toggle.checked) {

      // Llamamos a tu función validadora
      if (this.validateMinItemsOnArray()) {
        // REVERTIMOS: Lo volvemos a poner en true visualmente
        toggle.checked = true;

        // Mostramos el error y cortamos la ejecución
        this.showError.emit("Debe haber al menos una opción seleccionada.");
        return;
      }
    }

    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;

    // Clonamos el objeto para no mutar directamente la referencia hasta guardar, 
    // aunque en este caso actualizamos el flag local para reflejar UI.
    item.isFeatured = isChecked;

    const index = this.featuredToUpdate.findIndex(
      (existingItem) => existingItem.itemName === item.itemName
    );

    if (index === -1) {
      // Si no estaba en la lista de cambios, lo agregamos
      this.featuredToUpdate.push(item);
    } else {
      // Si ya estaba, actualizamos su estado
      this.featuredToUpdate[index] = item;
    }

    console.log("Cambios pendientes:", this.featuredToUpdate);



  }

  validateMinItemsOnArray() {
    const totalActive = this.items.filter(i => i.isFeatured).length;
    let isOnlyOne = totalActive <= 1
    if (isOnlyOne) alert(`⚠️ No puedes desactivar ${this.items[0].itemName}. Debe haber al menos una opción visible en el filtro.`);
    return isOnlyOne
  }

  onDeleteItem(item: GenericItem) {
    this.onDelete.emit(item);
  }



  onSeeItem(item: GenericItem) {
    this.onSee.emit(item);
  }
}