'use client';

import { useState } from 'react';
import './DraftCard.css';
import Button from '@/Components/Button/Button';
import { LuCheck, LuTriangleAlert } from 'react-icons/lu';

// Borrador de evolución (STATE 07) — la IA genera el texto, pero el usuario
// mantiene el control: puede editarlo antes de guardar, y nada queda en la
// historia real hasta que hace click en "Guardar en historia" (brief "La IA
// genera el borrador, pero el usuario mantiene el control"). `texto` es
// controlado por el padre (turn.payload.drafts[i]) — este componente no
// guarda una copia local, así que "Guardar" siempre persiste lo último
// editado.
export default function DraftCard({
  nombre, cama, texto, saved, onChangeText, onSave,
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className={`cai-draft${saved ? ' cai-draft--saved' : ''}`}>
      <div className="cai-draft-head">
        <span className="cai-draft-title">Borrador de evolución</span>
        {saved && (
          <span className="cai-draft-saved-badge">
            <LuCheck className="icon" aria-hidden="true" />
            Guardado
          </span>
        )}
      </div>
      <p className="cai-draft-patient">{nombre} · Cama {cama}</p>

      {editing && !saved ? (
        <textarea
          className="cai-draft-textarea"
          value={texto}
          onChange={(e) => onChangeText(e.target.value)}
          rows={4}
          aria-label={`Editar borrador de evolución de ${nombre}`}
          autoFocus
        />
      ) : (
        <p className="cai-draft-text">{texto}</p>
      )}

      {!saved && (
        <p className="cai-draft-warning">
          <LuTriangleAlert className="icon" aria-hidden="true" />
          Revisar antes de guardar
        </p>
      )}

      {!saved && (
        <div className="cai-inline-actions">
          <Button variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
            {editing ? 'Listo' : 'Editar'}
          </Button>
          <Button variant="primary" size="sm" onClick={onSave}>Guardar en historia</Button>
        </div>
      )}
    </div>
  );
}
