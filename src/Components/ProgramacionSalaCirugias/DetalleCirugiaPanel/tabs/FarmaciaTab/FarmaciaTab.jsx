'use client';

import './FarmaciaTab.css';
import { FARMACIA_ESTADO_LABEL, fechaHoraLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

export default function FarmaciaTab({ cirugia }) {
  const { farmacia } = cirugia;
  return (
    <div className="ft-tab">
      <div className="ft-head">
        <div className="ft-head-info">
          <span className="ft-label">Pedido</span>
          <span className="ft-value">#{farmacia.numeroPedido}</span>
        </div>
        <span className={`ft-tag ft-tag-${farmacia.estado}`}>{FARMACIA_ESTADO_LABEL[farmacia.estado]}</span>
      </div>
      <div className="ft-solicitud">Solicitado: {fechaHoraLabel(farmacia.fechaSolicitud)}</div>
      <table className="ft-table">
        <thead><tr><th>Medicamento</th><th>Dosis</th></tr></thead>
        <tbody>
          {farmacia.medicamentos.map((m) => (
            <tr key={m.nombre}><td>{m.nombre}</td><td>{m.dosis}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
