import './SafetyFooter.css';

// Aviso de confianza/seguridad fijo al pie del panel — deja explícito que la
// IA no reemplaza el criterio clínico profesional (brief "Confianza y
// seguridad").
//
// "Más información" es texto plano, no un link/botón: todavía no hay
// contenido de ayuda real al que llevar (hallazgo de la auditoría UX de este
// panel, heurística 10) — dejarlo con apariencia de link vivo prometía una
// acción que no existe. Cuando haya un destino real (modal de ayuda, doc),
// vuelve a ser interactivo.
export default function SafetyFooter() {
  return (
    <p className="cai-safety-footer">
      Kora puede cometer errores. Verifica siempre la información clínica.{' '}
      <span className="cai-safety-more">Más información</span>
    </p>
  );
}
