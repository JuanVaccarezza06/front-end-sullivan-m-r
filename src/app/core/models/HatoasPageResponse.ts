export interface HatoasPageResponse<T> {
  _embedded: {
    // Esto es un "Index Signature". Significa: "Cualquier string que use como clave, devuelve un array de T"
    [key: string]: T[]; 
  };
  _links: {
    first: { href: string };
    prev?: { href: string };
    self: { href: string };
    next?: { href: string };
    last: { href: string };
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}