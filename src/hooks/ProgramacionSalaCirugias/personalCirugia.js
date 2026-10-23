// Roles de personal de una cirugía (Paso 2 del wizard "Nueva cirugía"). Lógica
// pura. `catalogo` es el `descripcion` de MEDICOS_CATALOGO que filtra
// CatalogoMedicosModal (Ayudante sale de los cirujanos). Ningún rol es
// obligatorio hoy (encargo explícito: cirujano y anestesiólogo ya no bloquean
// el paso); `obligatorio: true` en un rol vuelve a exigirlo, con su resaltado y
// aviso en el wizard. Cada rol admite varias personas.
export const ROLES_PERSONAL = [
  { rol: 'Cirujano', catalogo: 'Cirujano', obligatorio: false },
  { rol: 'Anestesiólogo', catalogo: 'Anestesiólogo', obligatorio: false },
  { rol: 'Ayudante', catalogo: 'Cirujano', obligatorio: false },
  { rol: 'Instrumentadora', catalogo: 'Instrumentadora', obligatorio: false },
  { rol: 'Circulante', catalogo: 'Circulante', obligatorio: false },
];

// Roles obligatorios sin ninguna persona, en el orden de ROLES_PERSONAL.
export function rolesObligatoriosFaltantes(personal = []) {
  return ROLES_PERSONAL
    .filter((r) => r.obligatorio && !personal.some((p) => p.rol === r.rol))
    .map((r) => r.rol);
}
