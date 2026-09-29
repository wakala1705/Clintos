'use client';

import { useEffect, useState } from 'react';
import './DetalleTrabajoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import { ESTADO_LABEL, ESTADO_TONE, TIPO_LABEL, TIPO_TONE, formatFechaInicio } from '@/hooks/Trazabilidad/mockTrazabilidadData';
import { LuCheck, LuCopy } from 'react-icons/lu';

// Resalta claves/strings/números/booleanos/null de un JSON ya
// pretty-printed -- sin librería (no hay precedente de syntax highlighting
// en el proyecto, ver research): regex clásica sobre el texto ya escapado
// como HTML, nunca sobre el valor crudo (evita inyectar markup si el
// payload/response llegara a traer algo con `<`/`>`/`&`).
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function highlightJson(value) {
  const escaped = escapeHtml(JSON.stringify(value, null, 2));
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'dtj-json-number';
      if (/^"/.test(match)) cls = /:$/.test(match) ? 'dtj-json-key' : 'dtj-json-string';
      else if (match === 'true' || match === 'false') cls = 'dtj-json-boolean';
      else if (match === 'null') cls = 'dtj-json-null';
      return `<span class="${cls}">${match}</span>`;
    },
  );
}

// Copiar (Job ID / Payload / Response): un solo estado `copied` con el
// nombre del target copiado en vez de 3 flags sueltas -- mismo toggle
// ícono+timeout que handleCopiarId en EventoDetailModal.jsx.
export default function DetalleTrabajoModal({ trabajo, onClose }) {
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (!trabajo) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [trabajo, onClose]);

  if (!trabajo) return null;

  function handleCopy(target, text) {
    navigator.clipboard?.writeText(text);
    setCopied(target);
    window.setTimeout(() => setCopied((c) => (c === target ? null : c)), 1600);
  }

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card dtj-modal-card" role="dialog" aria-modal="true" aria-labelledby="dtj-title">
        <ModalHeader
          title="Detalle del Trabajo de Facturación"
          titleId="dtj-title"
          trailing={<span className="dtj-eyebrow">Auditoría real</span>}
          onClose={onClose}
          autoFocusClose
        />

        <div className="modal-body dtj-body">
          <div className="dtj-jobid-row">
            <div className="dtj-jobid-block">
              <span className="dtj-jobid-caption">Job ID:</span>
              <span className="dtj-jobid-value">{trabajo.jobId}</span>
              <button
                type="button"
                className="traz-copy-btn"
                onClick={() => handleCopy('jobId', trabajo.jobId)}
                aria-label="Copiar Job ID"
              >
                {copied === 'jobId' ? <LuCheck className="icon" /> : <LuCopy className="icon" />}
              </button>
            </div>
            <div className="dtj-jobid-badges">
              <Badge tone={TIPO_TONE[trabajo.tipo]}>{TIPO_LABEL[trabajo.tipo].toUpperCase()}</Badge>
              <Badge tone={ESTADO_TONE[trabajo.estado]}>{ESTADO_LABEL[trabajo.estado].toUpperCase()}</Badge>
              <Badge tone="neutral">Etapa: {trabajo.etapa.toLowerCase()}</Badge>
            </div>
          </div>

          <dl className="dtj-info-card">
            <div className="dtj-field"><dt>N° Factura</dt><dd>{trabajo.numeroFactura}</dd></div>
            <div className="dtj-field"><dt>Consecutivo (CNSFCT)</dt><dd>{trabajo.consecutivo}</dd></div>
            <div className="dtj-field"><dt>N° Admisión</dt><dd>{trabajo.numeroAdmision}</dd></div>
            <div className="dtj-field"><dt>Tercero (IDTERCERO)</dt><dd>{trabajo.idTercero}</dd></div>
            <div className="dtj-field"><dt>Transacción (IDT)</dt><dd>{trabajo.idTransaccion ?? '—'}</dd></div>
            <div className="dtj-field"><dt>Usuario Ejecutor</dt><dd>{trabajo.usuario}</dd></div>
            <div className="dtj-field"><dt>Sede / Compañía</dt><dd>{trabajo.sedeCompania}</dd></div>
            <div className="dtj-field"><dt>Servidor (HOSTNAME)</dt><dd>{trabajo.servidor}</dd></div>
            <div className="dtj-field"><dt>Reintentos</dt><dd>{trabajo.intentos}</dd></div>
          </dl>

          <dl className="dtj-timing-card">
            <div className="dtj-field"><dt>Fecha Creación</dt><dd>{formatFechaInicio(trabajo.fechaCreacion)}</dd></div>
            <div className="dtj-field"><dt>Fecha Inicio</dt><dd>{formatFechaInicio(trabajo.fechaInicio)}</dd></div>
            <div className="dtj-field"><dt>Fecha Fin</dt><dd>{trabajo.fechaFin ? formatFechaInicio(trabajo.fechaFin) : '—'}</dd></div>
            <div className="dtj-field">
              <dt>Duración de Ejecución</dt>
              <dd className="dtj-duration">{trabajo.duracionSegundos != null ? `${trabajo.duracionSegundos} s` : '—'}</dd>
            </div>
          </dl>

          <div className="dtj-code-section">
            <div className="dtj-code-header">
              <span className="dtj-eyebrow">Parámetros de entrada (payload)</span>
              <button
                type="button"
                className="traz-copy-btn"
                onClick={() => handleCopy('payload', JSON.stringify(trabajo.payload, null, 2))}
                aria-label="Copiar payload"
              >
                {copied === 'payload' ? <LuCheck className="icon" /> : <LuCopy className="icon" />}
              </button>
            </div>
            {/* dangerouslySetInnerHTML: JSON.stringify propio (mock), escapado a HTML antes de resaltar (ver highlightJson arriba), no input de usuario. */}
            <pre className="dtj-code-block"><code dangerouslySetInnerHTML={{ __html: highlightJson(trabajo.payload) }} /></pre>
          </div>

          <div className="dtj-code-section">
            <div className="dtj-code-header">
              <span className="dtj-eyebrow">Resultado de la operación (response)</span>
              <button
                type="button"
                className="traz-copy-btn"
                onClick={() => handleCopy('response', JSON.stringify(trabajo.response, null, 2))}
                aria-label="Copiar response"
              >
                {copied === 'response' ? <LuCheck className="icon" /> : <LuCopy className="icon" />}
              </button>
            </div>
            <pre className="dtj-code-block dtj-code-scroll"><code dangerouslySetInnerHTML={{ __html: highlightJson(trabajo.response) }} /></pre>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cerrar Detalle</Button>
        </div>
      </div>
    </div>
  );
}
