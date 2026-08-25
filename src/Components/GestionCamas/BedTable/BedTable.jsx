import './BedTable.css';
import EstadoCamaBadge from '../EstadoCamaBadge/EstadoCamaBadge';
import BedActionsMenu from '../BedActionsMenu/BedActionsMenu';
import {
  AREA_LABEL, PISO_LABEL, SECTOR_LABEL, SEDE_LABEL,
} from '@/hooks/GestionCamas/mockCamasData';
import { LuEye } from 'react-icons/lu';

export default function BedTable({ camas, onAction }) {
  return (
    <div className="data-table-wrap cb-table-wrap">
      <table className="data-table cb-table">
        <thead>
          <tr>
            <th>Cama</th>
            <th>Sede</th>
            <th>Área</th>
            <th>Piso</th>
            <th>Sector</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Paciente</th>
            <th className="col-acciones"><span className="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {camas.map((c) => (
            <tr key={c.id}>
              <td className="cell-primary">{c.numero}</td>
              <td className="cell-muted">{SEDE_LABEL[c.sede]}</td>
              <td className="cell-muted">{AREA_LABEL[c.area]}</td>
              <td className="cell-muted">{PISO_LABEL[c.piso]}</td>
              <td className="cell-muted">{SECTOR_LABEL[c.sector]}</td>
              <td className="cell-muted">{c.tipo}</td>
              <td><EstadoCamaBadge estado={c.estado} /></td>
              <td>
                {c.paciente ? (
                  <>
                    {c.paciente.nombre}
                    <span className="cell-sub">{c.paciente.hc}</span>
                  </>
                ) : <span className="cell-muted">—</span>}
              </td>
              <td className="col-acciones">
                <div className="cb-table-actions">
                  <button
                    type="button"
                    className="cb-actions-menu-btn"
                    onClick={() => onAction('ver-detalle', c.id)}
                    aria-label={`Ver detalle de cama ${c.numero}`}
                    title="Ver detalle"
                  >
                    <LuEye className="icon" />
                  </button>
                  <BedActionsMenu estado={c.estado} numero={c.numero} onAction={(action) => onAction(action, c.id)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
