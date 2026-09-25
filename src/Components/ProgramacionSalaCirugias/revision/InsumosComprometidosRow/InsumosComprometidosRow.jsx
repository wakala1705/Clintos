'use client';

import { LuInfo } from 'react-icons/lu';
import { FARMACIA_ESTADO_LABEL, fechaHoraLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import './InsumosComprometidosRow.css';

// Subfila expandida bajo una programación "Insumos comprometidos": el pedido
// que quedó hecho sin que el paciente pasara a cirugía. Es el contexto que
// hace falta para decidir entre cancelar o marcar incumplida.
export default function InsumosComprometidosRow({ id, cirugia, colSpan }) {
  const { farmacia } = cirugia;
  const medicamentos = farmacia.medicamentos ?? [];
  return (
    <tr id={id} className="rv-insumos-row">
      <td colSpan={colSpan}>
        <div className="rv-insumos-box">
          <dl className="rv-insumos-meta">
            <div>
              <dt>N° de pedido</dt>
              <dd>{farmacia.numeroPedido}</dd>
            </div>
            <div>
              <dt>Estado del pedido</dt>
              <dd>{FARMACIA_ESTADO_LABEL[farmacia.estado] ?? '—'}</dd>
            </div>
            <div>
              <dt>Solicitado</dt>
              <dd>{farmacia.fechaSolicitud ? fechaHoraLabel(farmacia.fechaSolicitud) : '—'}</dd>
            </div>
          </dl>
          {medicamentos.length > 0 ? (
            <ul className="rv-insumos-list">
              {medicamentos.map((med) => (
                <li key={med.nombre}>
                  <span className="rv-insumos-nombre">{med.nombre}</span>
                  <span className="rv-insumos-dosis">{med.dosis}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rv-insumos-vacio">Sin ítems registrados en el pedido.</p>
          )}
          <p className="rv-insumos-nota">
            <LuInfo className="icon" aria-hidden="true" />
            Al cancelar o marcar incumplida, el pedido se marca para devolución.
          </p>
        </div>
      </td>
    </tr>
  );
}
