import './ConfirmActionCard.css';
import Button from '@/Components/Button/Button';
import { LuCheck, LuFilePen, LuX } from 'react-icons/lu';

// Acción sensible: propuesta → preview → confirmación del usuario (STATE 06)
// — nunca se ejecuta sola. `resolved` ('confirmed'/'cancelled'/undefined)
// deja el card en un estado final tras confirmar/cancelar, para que no se
// pueda disparar dos veces desde el mismo turno de conversación.
//
// El tono ámbar + ícono de lápiz son solo mientras está "pendiente de tu
// decisión" — una vez resuelto, el card pasa a un tratamiento neutro con
// ícono de check/cancelado, para que el estado final se distinga del de
// alerta activa (hallazgo de la auditoría UX de este panel, heurística 1).
//
// `lines` (2 líneas: identificación + propuesta, no un párrafo) y orden de
// botones Cancelar-luego-Confirmar — mismo formato del mockup de la segunda
// iteración. `items` son los pacientes completos (no solo id/nombre/cama):
// ClintosAIPanel los necesita enteros para generar cada borrador al
// confirmar, este card solo lee `paciente`/`cama` para la lista de preview.
export default function ConfirmActionCard({
  title, lines, items, confirmLabel, cancelLabel, onConfirm, onCancel, resolved,
}) {
  const ResolvedIcon = resolved === 'confirmed' ? LuCheck : LuX;

  return (
    <div className={`cai-confirm${resolved ? ` cai-confirm--${resolved}` : ''}`}>
      <div className="cai-confirm-head">
        <span className="cai-icon-circle cai-confirm-icon">
          {resolved
            ? <ResolvedIcon className="icon" aria-hidden="true" />
            : <LuFilePen className="icon" aria-hidden="true" />}
        </span>
        <p className="cai-confirm-title">{title}</p>
      </div>
      {lines.map((line) => <p key={line} className="cai-confirm-desc">{line}</p>)}
      <ul className="cai-confirm-items">
        {items.map((it) => <li key={it.id}>{it.paciente} · Cama {it.cama}</li>)}
      </ul>
      {!resolved && (
        <div className="cai-inline-actions">
          <Button variant="outline" size="sm" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant="primary" size="sm" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      )}
    </div>
  );
}
