'use client';

import { useState } from 'react';
import './AdmisionesTable.css';
import TriageBadge from './TriageBadge/TriageBadge';
import RowActionsMenu from './RowActionsMenu/RowActionsMenu';
import { ESTADO_LABEL } from '@/hooks/Admisiones/mockAdmisionesData';
import { LuEye, LuPencil } from 'react-icons/lu';
import Button from '@/Components/Button/Button';

// Tabla de escritorio/tablet + tarjetas de mobile del mismo dataset — se
// renderizan ambas y la CSS decide cuál mostrar según el ancho bajo 768px
// (--bp-tablet, ver AGENTS.md), mismo patrón que PatientsTable/AgendaTable.
// Clic selecciona (resalta) la fila, igual que AgendaTable — acá no hay una
// "acción de abrir" por doble clic porque el detalle ya tiene su propio
// botón directo (columna "Detalles"), así que un solo clic ya cubre la
// única interacción de fila que hace falta.
export default function AdmisionesTable({ admisiones, onEditar, onDetalle, onRegistrarTriage, onAltaMedica, onAltaAdministrativa, onVerHistoria }) {
  const [selectedId, setSelectedId] = useState(null);

  function handleRowKeyDown(e, id) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    setSelectedId(id);
  }

  function rowActionsProps(a) {
    return {
      nombre: a.nombreAfiliado,
      onRegistrarTriage: () => onRegistrarTriage(a),
      onAltaMedica: () => onAltaMedica(a),
      onAltaAdministrativa: () => onAltaAdministrativa(a),
      onVerHistoria: () => onVerHistoria(a),
    };
  }

  return (
    <>
      <div className="adm-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>N° Admisión</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Triage</th>
              <th>Estado</th>
              <th>Documento</th>
              <th>Nombre del afiliado</th>
              <th>Atendido</th>
              <th>Administradora</th>
              <th>Tipo de contrato</th>
              <th>Tipo de admisión</th>
              <th className="col-acciones"><span className="sr-only">Acciones</span></th>
              <th className="col-acciones"><span className="sr-only">Editar</span></th>
              <th className="col-acciones"><span className="sr-only">Detalles</span></th>
            </tr>
          </thead>
          <tbody>
            {admisiones.map((a) => (
              <tr
                key={a.id}
                className={selectedId === a.id ? 'selected' : undefined}
                aria-selected={selectedId === a.id}
                tabIndex={0}
                onClick={() => setSelectedId(a.id)}
                onKeyDown={(e) => handleRowKeyDown(e, a.id)}
              >
                <td className="cell-primary">{a.numeroAdmision}</td>
                <td className="cell-muted">{a.fecha}</td>
                <td className="cell-muted">{a.hora}</td>
                <td><TriageBadge level={a.triage} /></td>
                <td><span className={`adm-estado adm-estado-${a.estado}`}>{ESTADO_LABEL[a.estado]}</span></td>
                <td className="cell-muted">{a.documento}</td>
                <td className="cell-primary">{a.nombreAfiliado}</td>
                <td><span className={a.atendido ? 'adm-atendido-si' : 'adm-atendido-no'}>{a.atendido ? 'SI' : 'NO'}</span></td>
                <td className="cell-muted">{a.administradora}</td>
                <td className="cell-muted">{a.tipoContrato}</td>
                <td className="cell-muted">{a.tipoAdmision}</td>
                <td className="col-acciones" onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu {...rowActionsProps(a)} />
                </td>
                <td className="col-acciones">
                  <button type="button" className="adm-icon-btn" onClick={(e) => { e.stopPropagation(); onEditar(a); }} aria-label={`Editar admisión de ${a.nombreAfiliado}`} title="Editar">
                    <LuPencil className="icon" />
                  </button>
                </td>
                <td className="col-acciones">
                  <button type="button" className="adm-icon-btn" onClick={(e) => { e.stopPropagation(); onDetalle(a); }} aria-label={`Ver detalles de ${a.nombreAfiliado}`} title="Detalles">
                    <LuEye className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="adm-cards">
        {admisiones.map((a) => (
          <div
            className={`adm-card${selectedId === a.id ? ' selected' : ''}`}
            key={a.id}
            aria-selected={selectedId === a.id}
            tabIndex={0}
            onClick={() => setSelectedId(a.id)}
            onKeyDown={(e) => handleRowKeyDown(e, a.id)}
          >
            <div className="adm-card-top">
              <TriageBadge level={a.triage} />
              <div className="adm-card-id">
                <div className="adm-card-name">{a.nombreAfiliado}</div>
                <div className="adm-card-doc">{a.numeroAdmision} · Doc. {a.documento}</div>
              </div>
              <span className={`adm-estado adm-estado-${a.estado}`}>{ESTADO_LABEL[a.estado]}</span>
            </div>
            <div className="adm-card-meta">
              <span>{a.fecha} · {a.hora} · Atendido: {a.atendido ? 'SI' : 'NO'}</span>
              <span>{a.administradora}</span>
              <span>{a.tipoContrato} · {a.tipoAdmision}</span>
            </div>
            <div className="adm-card-actions" onClick={(e) => e.stopPropagation()}>
              <Button variant="secondary" icon={LuEye} className="adm-detalle-btn" onClick={() => onDetalle(a)}>
                Detalles
              </Button>
              <button type="button" className="adm-icon-btn" onClick={() => onEditar(a)} aria-label={`Editar admisión de ${a.nombreAfiliado}`} title="Editar">
                <LuPencil className="icon" />
              </button>
              <RowActionsMenu {...rowActionsProps(a)} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
