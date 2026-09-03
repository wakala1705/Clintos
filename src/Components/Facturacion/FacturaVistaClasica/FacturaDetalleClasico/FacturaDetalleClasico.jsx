'use client';

import './FacturaDetalleClasico.css';
import Button from '@/Components/Button/Button';
import { formatCOP } from '@/hooks/Facturacion/mockFacturasData';
import {
  LuArrowLeft, LuBan, LuBuilding2, LuCopy, LuDollarSign, LuFileMinus, LuFileStack, LuFileText, LuPencil, LuPlus, LuPrinter,
} from 'react-icons/lu';

const ACCIONES = [
  { key: 'imprimir', label: 'Imprimir', icon: LuPrinter },
  { key: 'otras-monedas', label: 'Otras monedas', icon: LuDollarSign },
  { key: 'admisiones-masivas', label: 'Admisiones masivas', icon: LuFileStack },
  { key: 'anular', label: 'Anular', icon: LuBan },
  { key: 'razon-anulacion', label: 'Razón anulación', icon: LuFileMinus },
  { key: 'copias', label: 'Copias', icon: LuCopy },
];

const ITEM_COLUMNS = [
  'Item', 'Referencia', 'Descripción', 'Prefijo', 'Cantidad', 'Vlr. Unidad', 'Vlr. Servicio',
  'Vlr. IVA', 'Vlr. Copago', 'Vlr. Moderador', 'Vlr. Pag.Comp', 'Descuento', 'Vlr. Total', 'CCosto',
];

// Panel inferior de la vista clásica: barra de datos de la admisión (+
// Nuevo/Editar), fila de acciones (sin funcionalidad real), grilla densa de
// ítems (mismas columnas que el formulario legacy de referencia) y footer
// con anexos + total + Regresar. Sin selección: mensaje de estado vacío,
// mismo criterio que FacturaDetallePanel (vista nueva).
export default function FacturaDetalleClasico({ factura }) {
  if (!factura) {
    return (
      <div className="fvc-detail fvc-detail-empty">
        Selecciona una factura en la grilla para ver su detalle.
      </div>
    );
  }

  return (
    <div className="fvc-detail">
      <div className="fvc-info-bar">
        <div className="fvc-info-item">
          <span className="fvc-info-label">No. Admisión:</span>
          <span className="fvc-info-value">{factura.noAdmision}</span>
        </div>
        <div className="fvc-info-item">
          <span className="fvc-info-label">Nombre Afiliado:</span>
          <span className="fvc-info-value fvc-info-name">{factura.nombreAfiliado}</span>
        </div>
        <div className="fvc-info-item">
          <span className="fvc-info-label">Total Factura:</span>
          <span className="fvc-info-value fvc-info-total">{formatCOP(factura.valorTotal)}</span>
        </div>
        <div className="fvc-info-spacer" />
        <Button size="sm" icon={LuPlus}>Nuevo</Button>
        <Button variant="secondary-accent" size="sm" icon={LuPencil}>Editar</Button>
      </div>

      <div className="fvc-acciones-bar">
        {ACCIONES.map(({ key, label, icon: Icon }) => (
          <Button key={key} variant="secondary-accent" size="sm" icon={Icon}>{label}</Button>
        ))}
      </div>

      <div className="fvc-items-scroll">
        <table className="fvc-grid fvc-items-grid">
          <thead>
            <tr>{ITEM_COLUMNS.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {factura.items.map((item, idx) => (
              <tr key={`${item.referencia}-${idx}`} className={idx === 0 ? 'selected' : ''}>
                <td>{String(idx + 1).padStart(3, '0')}</td>
                <td>{item.referencia}</td>
                <td className="fvc-ellipsis" title={item.descripcion}>{item.descripcion}</td>
                <td className="fvc-num">{item.prefijo}</td>
                <td className="fvc-num">{item.cantidad}</td>
                <td className="fvc-num">{formatCOP(item.vlrUnidad)}</td>
                <td className="fvc-num">{formatCOP(item.vlrServicio)}</td>
                <td className="fvc-num">{formatCOP(item.vlrIVA)}</td>
                <td className="fvc-num">{formatCOP(item.vlrCopago)}</td>
                <td className="fvc-num">{formatCOP(item.vlrModerador)}</td>
                <td className="fvc-num">{formatCOP(item.vlrPagComp)}</td>
                <td className="fvc-num">{formatCOP(item.descuento)}</td>
                <td className="fvc-num">{formatCOP(item.vlrUnidad)}</td>
                <td>{item.ccosto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="fvc-footer-bar">
        <div className="fvc-footer-left">
          <Button variant="secondary-accent" size="sm" icon={LuPrinter}>Imprimir anexo</Button>
          <Button variant="secondary-accent" size="sm" icon={LuFileText}>Anexo por prefijo</Button>
          <Button variant="secondary-accent" size="sm" icon={LuBuilding2}>Capitados</Button>
        </div>
        <div className="fvc-footer-right">
          <span className="fvc-footer-total-label">Total Factura:</span>
          <span className="fvc-footer-total-value">{formatCOP(factura.valorTotal)}</span>
          <Button variant="secondary-accent" size="sm" icon={LuArrowLeft}>Regresar</Button>
        </div>
      </div>
    </div>
  );
}
