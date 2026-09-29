'use client';

import { useState } from 'react';
import './TrazabilidadTable.css';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import { ESTADO_LABEL, ESTADO_TONE, TIPO_LABEL, TIPO_TONE, formatFechaInicio } from '@/hooks/Trazabilidad/mockTrazabilidadData';
import { LuCheck, LuCopy, LuEye } from 'react-icons/lu';

// Copiar Job ID: mismo toggle ícono+timeout que handleCopiarId en
// EventoDetailModal.jsx (GestionCamas/GestionCamasAuditoria) -- único
// precedente de "copiar al portapapeles" del proyecto, acá adaptado a un
// botón ícono-solo por fila (sin precedente de eso todavía, ver research).
export default function TrazabilidadTable({ items, onVer }) {
  const [copiedId, setCopiedId] = useState(null);

  function handleCopy(jobId) {
    navigator.clipboard?.writeText(jobId);
    setCopiedId(jobId);
    window.setTimeout(() => setCopiedId((c) => (c === jobId ? null : c)), 1600);
  }

  return (
    <table className="data-table traz-table">
      <thead>
        <tr>
          <th>Job ID</th>
          <th>Tipo</th>
          <th>N° Factura</th>
          <th>Referencia</th>
          <th>Usuario</th>
          <th>Estado</th>
          <th>Etapa</th>
          <th className="traz-col-intentos">Intentos</th>
          <th>Fecha Inicio</th>
          <th className="col-acciones"><span className="sr-only">Acciones</span></th>
        </tr>
      </thead>
      <tbody>
        {items.map((t) => (
          <tr key={t.id}>
            <td className="traz-jobid-cell">
              <span className="traz-jobid" title={t.jobId}>{t.jobId.slice(0, 8)}...</span>
              <button
                type="button"
                className="traz-copy-btn"
                onClick={() => handleCopy(t.jobId)}
                aria-label={`Copiar Job ID ${t.jobId}`}
              >
                {copiedId === t.jobId ? <LuCheck className="icon" /> : <LuCopy className="icon" />}
              </button>
            </td>
            <td><Badge tone={TIPO_TONE[t.tipo]}>{TIPO_LABEL[t.tipo].toUpperCase()}</Badge></td>
            <td className="cell-primary">{t.numeroFactura}</td>
            <td className="cell-muted">{t.referencia}</td>
            <td className="cell-muted">{t.usuario}</td>
            <td><Badge tone={ESTADO_TONE[t.estado]}>{ESTADO_LABEL[t.estado].toUpperCase()}</Badge></td>
            <td className="cell-muted">{t.etapa}</td>
            <td className={`traz-col-intentos${t.intentos > 0 ? ' traz-intentos-alert' : ''}`}>{t.intentos}</td>
            <td className="cell-muted">{formatFechaInicio(t.fechaInicio)}</td>
            <td className="col-acciones">
              <Button variant="secondary" size="sm" icon={LuEye} onClick={() => onVer(t)}>Ver</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
