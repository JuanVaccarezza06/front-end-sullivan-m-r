export default interface JwtPayload {
  /**
   * Subject (El "sujeto" del token)
   * En tu caso, es el username: "Sonia123#"
   */
  sub: string;

  /**
   * Roles (La lista de permisos del usuario)
   * En tu caso: ['ROLE_ADMIN', 'ROLE_AGENT', 'ROLE_...']
   */
  roles: string[];

  /**
   * Issued At (Fecha de emisión del token)
   * Es un timestamp numérico: 1763095919
   */
  iat: number;

  /**
   * Expiration Time (Fecha de expiración del token)
   * Es un timestamp numérico: 1763096279
   */
  exp: number;
}