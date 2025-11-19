import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
export class InputImages implements OnChanges, OnInit {

  // Este es el arreglo que "persiste" tus imágenes en el frontend
  public imagePreviews: ImagePreview[] = [];

  @Input() group!: FormGroup;

  @Input() startSignal!: number;

  @Input() isUpdate!: boolean;

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

  ngOnInit(): void {
    if (this.isUpdate) this.patchValues()
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
        item.file?.name === file.name &&
        item.file?.size === file.size
      )) {
        console.log("⚠️ Esta imagen ya fue agregada: " + file.name);
        return;
      }
      // Añadimos al arreglo
      this.imagePreviews.push({
        name: file.name,
        file: file, // El objeto File (para subirlo después)
        previewUrl: previewUrl // La URL temporal (para mostrarla ahora)
      });
      this.syncWithParent()

    }
  }

  private syncWithParent() {
    // // Si hay elementos, mandamos el array. Si está vacío, mandamos null.
    // const valueToUpdate = this.imagePreviews.length > 0 ? this.imagePreviews : null;
    // console.log(this.imagePreviews.length)
    // this.group.get('images')?.setValue(valueToUpdate);
    // this.group.get('images')?.updateValueAndValidity();
  }

  // --- 4. Funciones para eliminar imágenes ---
  removeImage(index: number): void {
    // Importante: Revocamos la URL para liberar memoria
    URL.revokeObjectURL(this.imagePreviews[index].previewUrl);

    // Quitamos del arreglo
    this.imagePreviews.splice(index, 1);
    this.syncWithParent()
  }

  clearAllImages(): void {
    // Revocamos todas las URLs antes de limpiar
    this.imagePreviews.forEach(img => URL.revokeObjectURL(img.previewUrl));

    // Vaciamos el arreglo
    this.imagePreviews = [];
    this.syncWithParent()
  }

  setImages() {

    if (this.imagePreviews.length === 0) {
      console.log("No hay imágenes para subir");
      return;
    }

    // 1. SEPARAR las imágenes existentes de las nuevas
    // Estas son las que ya estaban (file === null) y no se borraron
    const existingImages: Image[] = this.imagePreviews
      .filter(item => !item.file) // Filtra las que NO tienen archivo (las viejas)
      .map(item => ({
        // Asumimos que guardaste el 'name' en patchValues, 
        // si no, tendrás que ajustarlo.
        // Si no tienes 'name', al menos guarda la URL.
        name: item.name || 'Imagen Existente', // <-- Ajusta esto
        url: item.previewUrl
      }));

    // 2. PREPARAR las nuevas para subir (Tu lógica, ¡perfecta!)
    const onlyUploadRequest = this.imagePreviews.filter(item => item.file);
    const onlyUploadRequestToFork = onlyUploadRequest.map(item => {
      return this.imgbbService.uploadImage(item.file as File);
    });

    // 3. MANEJAR EL CASO "SIN SUBIDAS"
    // ¿Qué pasa si el usuario solo borró imágenes, pero no agregó nuevas?
    if (onlyUploadRequestToFork.length === 0) {
      console.log("No hay imágenes nuevas para subir. Solo actualizando existentes.");

      // Seteamos solo las existentes que quedaron
      this.group.get('images')?.setValue(existingImages);

      console.log("Image input. Ya termine (sin subidas).");
      this.finishEvent.emit();
      return; // <-- ¡Importante! No continúes al forkJoin
    }

    // 4. EJECUTAR LAS SUBIDAS EN PARALELO (Tu código)
    forkJoin(onlyUploadRequestToFork).subscribe({
      next: (responses: ResponseImgBb[]) => {
        console.log('Respuestas crudas de ImgBB:', responses);

        // 5. EXTRAER URLs y names de las NUEVAS
        let newUploadedImages: Image[] = responses.map(res => ({
          name: res.data.title,
          url: res.data.url
        }));

        console.log('Imágenes nuevas subidas:', newUploadedImages);
        console.log('Imágenes existentes mantenidas:', existingImages);

        // 6. ¡LA FUSIÓN! Combinar las viejas + las nuevas
        const allImages = [...existingImages, ...newUploadedImages];

        // 7. GUARDAR EL ARRAY COMPLETO EN EL FORMULARIO
        this.group.get('images')?.setValue(allImages);

        console.log("Este es el group de image (completo):");
        console.log(this.group.get('images')?.value);

        console.log("Image input. Ya termine de setear los group.");
        this.finishEvent.emit();
      },
      error: (err) => {
        console.error('Error al subir alguna de las imágenes:', err);
        this.finishEvent.emit();
      }
    });
  }

  patchValues() {
    if (this.isUpdate) {
      // Tengo solo las imagenes en formato image, que es una url (la de imgbb) y un nombre, NO tengo la url de preview!!!!!
      const images = this.group.get('images')?.value as Image[]
      images.forEach(value => {
        this.imagePreviews.push({
          name: value.name,
          file: undefined,
          previewUrl: value.url
        })
      })

    }
  }


}
