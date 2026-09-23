import './SafetyFooter.css';

// Aviso de confianza/seguridad fijo al pie del panel — deja explícito que la
// IA no reemplaza el criterio clínico profesional (brief "Confianza y
// seguridad").
export default function SafetyFooter() {
  return (
    <p className="cai-safety-footer">
      Clintos AI puede cometer errores. Verifica siempre la información clínica.{' '}
      <button type="button" className="cai-safety-link">Más información</button>
    </p>
  );
}
