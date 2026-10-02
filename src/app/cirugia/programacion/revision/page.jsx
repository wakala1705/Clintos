import { redirect } from 'next/navigation';

// Página de revisión de programaciones vencidas oculta por ahora (encargo
// explícito, 2026-09-25): el aviso de vencidas del Resumen de agenda abre el
// modal "Listado de Programaciones - Revisión" en su lugar. La pantalla sigue
// implementada en @/Components/ProgramacionSalaCirugias/RevisionVencidas/
// RevisionVencidas -- para reactivarla, volver a renderizar ese componente acá.
export default function RevisionVencidasPage() {
  redirect('/programacion-sala-cirugias');
}
