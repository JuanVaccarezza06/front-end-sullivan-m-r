import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import Image from '../../../../models/property/complements/Image';
import { ImgBbService } from '../../../../services/propertyServices/imgBB/img-bb-service';
import ResponseImgBb from '../../../../models/property/request-response/ResponseImgBb';
import { forkJoin } from 'rxjs';
import ImagePreview from '../../../../models/property/complements/ImagePreview';

@Component({
  selector: 'app-input-images',
  imports: [ReactiveFormsModule],
  templateUrl: './input-images.html',
  styleUrl: './input-images.css',
})
export class InputImages implements OnChanges {

  // Este es el arreglo que "persiste" tus imágenes en el frontend
  public imagePreviews: ImagePreview[] = [];

  @Input() group!: FormGroup;

  @Input() startSignal!: number;

  @Output() finishEvent = new EventEmitter<boolean>();

  constructor(
    private imgbbService: ImgBbService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    // 1. Verifica si el Input cambió
    if (changes['startSignal']) {

      // 2. Opcional: Solo ejecutamos si el valor es mayor a 0 (es decir, ya se hizo un submit)
      // O solo ejecutamos si NO es la primera vez que se inicializa.
      if (!changes['startSignal'].firstChange) {
        this.setImages();
      }
    }
  }

  // --- Functions that will be execute when a file enter into the sistem! ---

  // This function catch the images and call a handleFiles (same that onDrop, but on click and select)
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) {
      return;
    }
    this.handleFiles(input.files);
  }

  // This function catch the images on drop and call a handleFiles (same that onFileSelect, but onDrop)
  onDrop(event: DragEvent): void {
    event.preventDefault(); // Previene que el navegador abra la imagen
    if (!event.dataTransfer?.files) {
      return;
    }
    this.handleFiles(event.dataTransfer.files);
  }

  // --- 2. Manejadores para Drag and Drop ---
  // If there is no this function, when an user drop on the file an image, it is open in other page
  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Previene que el navegador abra la imagen
  }

  // --- 3. Lógica central para procesar los archivos ---
  private handleFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Solo aceptamos imágenes
      if (!file.type.startsWith('image/')) {
        continue;
      }

      // Creamos la URL de previsualización
      const previewUrl = URL.createObjectURL(file);

      if (this.imagePreviews.some(item =>
        item.file.name === file.name &&
        item.file.size === file.size
      )) {
        console.log("⚠️ Esta imagen ya fue agregada: " + file.name);
        return;
      }
      // Añadimos al arreglo
      this.imagePreviews.push({
        file: file, // El objeto File (para subirlo después)
        previewUrl: previewUrl // La URL temporal (para mostrarla ahora)
      });
    }
  }

  // --- 4. Funciones para eliminar imágenes ---
  removeImage(index: number): void {
    // Importante: Revocamos la URL para liberar memoria
    URL.revokeObjectURL(this.imagePreviews[index].previewUrl);

    // Quitamos del arreglo
    this.imagePreviews.splice(index, 1);
  }

  clearAllImages(): void {
    // Revocamos todas las URLs antes de limpiar
    this.imagePreviews.forEach(img => URL.revokeObjectURL(img.previewUrl));

    // Vaciamos el arreglo
    this.imagePreviews = [];
  }

  setImages() {

    if (this.imagePreviews.length === 0) {
      console.log("No hay imágenes para subir");
      return;
    }

    // 2. PREPARAR LAS PETICIONES (MAPPING)
    // Aquí es donde "extraemos" el archivo real.
    // Recorremos el arreglo imagePreviews y por cada 'item',
    // sacamos solo 'item.file' para pasárselo al servicio.
    const uploadRequests = this.imagePreviews.map(item => {
      return this.imgbbService.uploadImage(item.file);
    });

    // 3. EJECUTAR TODAS LAS SUBIDAS EN PARALELO
    forkJoin(uploadRequests).subscribe({
      next: (responses: ResponseImgBb[]) => {
        console.log('Respuestas crudas de ImgBB:', responses);

        // 4. EXTRAER LAS URLS y names
        // ImgBB suele devolver la URL en: response.data.url
        // Mapeamos las respuestas para quedarnos solo con el string de la URL.
        let images: Image[] = responses.map(res => {
          return {
            name: res.data.title,
            url: res.data.url
          }
        })

        console.log('Images finales:', images);

        // 5. GUARDAR EN EL FORMULARIO
        // Ahora sí, guardamos el arreglo de strings (URLs) en tu formControl
        this.group.get('images')?.setValue(images);
        console.log("Este es el group de image:")
        console.log(this.group.get('images')?.value)

        console.log("Image input. Ya termine de setear los group.")
        this.finishEvent.emit()

      },
      error: (err) => {
        console.error('Error al subir alguna de las imágenes:', err);
        this.finishEvent.emit()
        // Aquí podrías mostrar una alerta al usuario
      }
    });

  }


}
