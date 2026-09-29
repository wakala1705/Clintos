'use client';

import { LuPackageCheck } from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import EstadoCirugiaBadge from '../../EstadoCirugiaBadge/EstadoCirugiaBadge';
import { SALAS, resumenCanasta } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import './CanastasTable.css';

const ESTADO_LABEL = {
  'sin-solicitar': 'Sin solicitar',
  'pendiente-recepcion': 'Pendiente de recepción',
  recibida: 'Recibida',
};
const ESTADO_TONE = {
  'sin-solicitar': 'neutral',
  'pendiente-recepcion': 'warn',
  recibida: 'success',
};

function salaDescripcion(salaId) {
  return SALAS.find((s) => s.value === salaId)?.descripcion ?? salaId;
}

// Fila = una cirugía (no un ítem de canasta, ver resumenCanasta en
// mockCirugiaData.js). Única acción disponible: abre ConfirmarRecepcionModal
// (el checklist de la canasta, encargo explícito 2026-09-29) -- la
// confirmación real ocurre ahí, no en esta fila. Las demás del flujo de
// insumos (pedir/cancelar/devolver) siguen viviendo en InsumosTab dentro de
// DetalleCirugiaPanel (rol de Programación, no de quirófano recibiendo).
export default function CanastasTable({ items, onAbrirRecepcion }) {
  return (
    <div className="cnc-table-wrap">
      <table className="cnc-table">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Paciente</th>
            <th>Sala</th>
            <th>Procedimiento</th>
            <th>Cirujano</th>
            <th>Insumos</th>
            <th>Estado</th>
            <th className="cnc-col-acciones">Acción</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => {
            const resumen = resumenCanasta(c);
            return (
              <tr key={c.id}>
                <td className="cnc-nowrap">
                  <div className="cnc-cell-primary">{c.horaInicio}</div>
                  {c.estado === 'urgencia' && (
                    <div className="cnc-urgencia">
                      <EstadoCirugiaBadge estado="urgencia" size="sm" />
                    </div>
                  )}
                </td>
                <td>
                  <div className="cnc-cell-primary">{c.paciente.nombre}</div>
                  <div className="cnc-cell-secondary">{c.paciente.documento}</div>
                </td>
                <td>{salaDescripcion(c.salaId)}</td>
                <td>{c.procedimientoPrincipal}</td>
                <td>{c.cirujano}</td>
                <td className="cnc-nowrap">{resumen.recibidos} de {resumen.total} recibidos</td>
                <td><Badge tone={ESTADO_TONE[resumen.estado]}>{ESTADO_LABEL[resumen.estado]}</Badge></td>
                <td className="cnc-col-acciones">
                  {resumen.estado === 'pendiente-recepcion' && (
                    <Button size="sm" icon={LuPackageCheck} onClick={() => onAbrirRecepcion(c)}>
                      Confirmar recepción
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
