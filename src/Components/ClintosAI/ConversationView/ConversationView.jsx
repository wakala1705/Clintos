import './ConversationView.css';
import { LuSparkles } from 'react-icons/lu';
import MessageBubble from '../MessageBubble/MessageBubble';
import PatientResultList from '../PatientResultList/PatientResultList';
import PatientSummaryCard from '../PatientSummaryCard/PatientSummaryCard';
import ConfirmActionCard from '../ConfirmActionCard/ConfirmActionCard';
import NavOptionsCard from '../NavOptionsCard/NavOptionsCard';
import DraftList from '../DraftList/DraftList';

// Cuerpo de la conversación (STATE 03-06): cada turno de Clintos AI se arma
// con el mismo avatar (icon-circle), y el `kind` que devolvió
// clintosAiEngine.js decide qué componente de respuesta renderiza — un solo
// punto de ramificación en vez de repetir el switch en cada turno.
export default function ConversationView({
  turns, onSelectPatient, onOpenHistoria, onConfirmAction, onCancelAction, onNavigate,
  onChangeDraftText, onSaveDraft,
}) {
  return (
    <div className="cai-conversation">
      {turns.map((turn) => {
        if (turn.role === 'user') {
          return <MessageBubble key={turn.id} role="user" text={turn.payload.text} />;
        }

        const { payload } = turn;
        return (
          <div key={turn.id} className="cai-assistant-row">
            <span className="cai-icon-circle cai-assistant-avatar"><LuSparkles className="icon" aria-hidden="true" /></span>
            <div className="cai-assistant-content">
              {turn.typing && <MessageBubble role="assistant" typing />}

              {!turn.typing && payload.kind === 'text' && (
                <MessageBubble role="assistant" text={payload.text} tone={payload.tone} />
              )}

              {!turn.typing && payload.kind === 'patient-list' && (
                <PatientResultList
                  intro={payload.intro}
                  items={payload.items}
                  followUp={payload.followUp}
                  onSelectPatient={onSelectPatient}
                  onOpenHistoria={onOpenHistoria}
                />
              )}

              {!turn.typing && payload.kind === 'patient-summary' && (
                <PatientSummaryCard
                  nombre={payload.nombre}
                  cama={payload.cama}
                  estado={payload.estado}
                  diagnostico={payload.diagnostico}
                  resumen={payload.resumen}
                  pendientes={payload.pendientes}
                  fuentes={payload.fuentes}
                  onVerOriginal={() => onOpenHistoria(payload.pacienteId)}
                />
              )}

              {!turn.typing && payload.kind === 'confirm-action' && (
                <ConfirmActionCard
                  title={payload.title}
                  lines={payload.lines}
                  items={payload.items}
                  confirmLabel={payload.confirmLabel}
                  cancelLabel={payload.cancelLabel}
                  resolved={turn.resolved}
                  onConfirm={() => onConfirmAction(turn.id, payload.items)}
                  onCancel={() => onCancelAction(turn.id)}
                />
              )}

              {!turn.typing && payload.kind === 'draft-list' && (
                <DraftList
                  intro={payload.intro}
                  drafts={payload.drafts}
                  onChangeDraftText={(draftId, texto) => onChangeDraftText(turn.id, draftId, texto)}
                  onSaveDraft={(draftId) => onSaveDraft(turn.id, draftId)}
                />
              )}

              {!turn.typing && payload.kind === 'nav-options' && (
                <NavOptionsCard text={payload.text} options={payload.options} onNavigate={onNavigate} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
