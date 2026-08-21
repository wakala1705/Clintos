import './InfoLine.css';

// "Label / valor" compacto (Ingreso, Última limpieza, Reservada para, Motivo,
// ETA de limpieza) — reusado por BedCard (reposo de la tarjeta) y
// BedDetailModal (bloque "Estado actual"), por eso vive en su propia carpeta
// en vez de duplicarse en los 2 (ver AGENTS.md "Component organization": un
// componente usado por 2+ consumidores de la misma feature vive aparte).
// `null` cuando no hay valor — nunca una fila vacía con guion.
export default function InfoLine({ label, value }) {
  if (!value) return null;
  return (
    <div className="cb-card-info">
      <span className="cb-card-info-label">{label}</span>
      <span className="cb-card-info-value">{value}</span>
    </div>
  );
}
