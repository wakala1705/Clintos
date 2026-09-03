'use client';

import './FacturasGridClasica.css';
import { formatCOP, formatFechaClasica } from '@/hooks/Facturacion/mockFacturasData';

const COLUMNS = [
  { key: 'flag', label: 'F' },
  { key: 'numero', label: 'No. Factura' },
  { key: 'documento', label: 'Documento' },
  { key: 'terceroRazonSocial', label: 'Tercero Razón Social' },
  { key: 'tipoContrato', label: 'Tipo Contrato' },
  { key: 'tipo', label: 'Tipo Factura' },
  { key: 'clase', label: 'Clase' },
  { key: 'fecha', label: 'F. Factura' },
  { key: 'fechaVencimiento', label: 'F. Vencimiento' },
  { key: 'valorTotal', label: 'Valor Total' },
  { key: 'c', label: 'C' },
  { key: 'flagFE', label: 'F.Elect FE' },
  { key: 'flagPE', label: 'PE' },
  { key: 'sedeCodigo', label: 'Sede' },
  { key: 'administradora', label: 'Administradora Afi' },
  { key: 'usuario', label: 'Usuario' },
  { key: 'procedencia', label: 'Procedencia' },
  { key: 'noAdmision', label: 'No. Admisión' },
  { key: 'idAfiliado', label: 'Id. Afiliado' },
  { key: 'impreso', label: 'Impreso' },
];

const TIPO_LABEL = { individual: 'Individual', capitada: 'Capitada' };
const CLASE_LABEL = { salud: 'Salud', particular: 'Particular' };

// Réplica de la grilla densa del formulario legacy de Facturas (encargo
// explícito, ver imagen de referencia) -- a diferencia de FacturaRow (vista
// nueva), acá SÍ se muestran las +18 columnas originales, con scroll
// horizontal propio (nunca scrollea la página, ver AGENTS.md "Responsive").
export default function FacturasGridClasica({ facturas, selectedId, onSelect }) {
  return (
    <div className="fvc-grid-scroll">
      <table className="fvc-grid">
        <thead>
          <tr>
            {COLUMNS.map((col) => <th key={col.key}>{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {facturas.map((f) => (
            <tr
              key={f.id}
              className={f.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(f.id)}
              tabIndex={0}
              aria-selected={f.id === selectedId}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(f.id); } }}
            >
              <td><span className="fvc-flag-badge">1</span></td>
              <td className="fvc-strong">{f.numero}</td>
              <td>{f.documento}</td>
              <td className="fvc-ellipsis" title={f.terceroRazonSocial}>{f.terceroRazonSocial}</td>
              <td>{f.tipoContrato}</td>
              <td>{TIPO_LABEL[f.tipo]}</td>
              <td>{CLASE_LABEL[f.clase]}</td>
              <td>{formatFechaClasica(f.fecha)}</td>
              <td>{formatFechaClasica(f.fechaVencimiento)}</td>
              <td className="fvc-num">{formatCOP(f.valorTotal)}</td>
              <td className="fvc-num">0</td>
              <td className="fvc-num">{f.flagFE}</td>
              <td>{f.flagPE}</td>
              <td>{f.sedeCodigo}</td>
              <td>{f.terceroId}</td>
              <td>{f.usuario}</td>
              <td>{f.procedencia}</td>
              <td>{f.noAdmision}</td>
              <td>{f.idAfiliado}</td>
              <td className="fvc-num">{f.impreso}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
