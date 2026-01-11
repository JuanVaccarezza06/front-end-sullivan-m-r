export interface HatoasPageResponse<T> {
  _embedded: {
    propertyDTOList: T[]; // Spring suele usar el nombre de la clase + List
  };
  _links: {
    first: { href: string };
    prev?: { href: string }; // Puede ser undefined si estás en la primera pag
    self: { href: string };
    next?: { href: string }; // Puede ser undefined si estás en la última pag
    last: { href: string };
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}
