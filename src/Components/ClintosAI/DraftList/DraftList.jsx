import './DraftList.css';
import DraftCard from '../DraftCard/DraftCard';

// Lista de borradores generados al confirmar "Preparar borradores de
// evolución" (STATE 07) — uno por paciente, cada uno con su propio estado de
// edición/guardado (ver ClintosAIPanel.handleChangeDraftText/handleSaveDraft,
// mismo criterio de estado por-ítem que ConfirmActionCard.resolved).
export default function DraftList({
  intro, drafts, onChangeDraftText, onSaveDraft,
}) {
  return (
    <div className="cai-draft-list">
      {intro && <p className="cai-msg-assistant">{intro}</p>}
      {drafts.map((d) => (
        <DraftCard
          key={d.id}
          nombre={d.nombre}
          cama={d.cama}
          texto={d.texto}
          saved={d.saved}
          onChangeText={(texto) => onChangeDraftText(d.id, texto)}
          onSave={() => onSaveDraft(d.id)}
        />
      ))}
    </div>
  );
}
