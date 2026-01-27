export interface ImageItem {
  id?: string | number; // ID si viene del backend
  url: string; // URL para mostrar (preview o final)
  file?: File; // El archivo real (solo para nuevas)
  isPrimary: boolean; // ¿Es la portada?
  position: number; // Para el orden 0, 1, 2...
  name: string; 
}
