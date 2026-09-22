'use client';

import './OrdenPreview.css';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import { SECCIONES_ORDEN } from '../shared/ordenSecciones';
import {
  LuCircleCheck, LuClipboardList, LuCopy, LuPencil, LuX,
} from 'react-icons/lu';

const COLUMNAS = [
  'Descripción', 'Dosis', 'Unidad de medida', 'Presentación', 'Vía',
  'Frecuencia', 'Duración', 'Cant.', 'Prioritario', 'Observaciones', 'Acciones',
];

// Columnas de dosificación: en consultas y laboratorios no aplican y se
// muestran como "-" sombreado (ver .op-na).
const CAMPOS_DOSIS = ['dosis', 'unidad', 'presentacion', 'via', 'frecuencia', 'duracion'];

function proximamente(accion) {
  window.ncToast?.(`${accion} (flujo en desarrollo).`);
}

function SeccionServicios({ titulo, icon: Icon, tono, items }) {
  return (
    <section className="op-section">
      <div className="op-section-head">
        <span className={`op-section-icon ${tono}`}><Icon className="icon" aria-hidden="true" /></span>
        <h4 className="op-section-title">{titulo}</h4>
        <Badge tone="neutral" className="op-count">{items.length} {items.length === 1 ? 'item' : 'items'}</Badge>
      </div>

      <div className="op-table-wrap">
        <table className="op-table">
          <thead>
            <tr>
              {COLUMNAS.map((c) => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="op-desc">{item.descripcion}</div>
                  {item.servicioContratado ? (
                    <div className="op-contrato ok"><LuCircleCheck className="icon" aria-hidden="true" />Servicio contratado</div>
                  ) : (
                    <div className="op-contrato no"><LuX className="icon" aria-hidden="true" />Servicio no contratado</div>
                  )}
                </td>
                {CAMPOS_DOSIS.map((campo) => (
                  item[campo]
                    ? <td key={campo}>{item[campo]}</td>
                    : <td key={campo} className="op-na">-</td>
                ))}
                <td>{item.cantidad}</td>
                <td>{item.prioritario ? 'Sí' : 'No'}</td>
                <td>{item.observaciones || '-'}</td>
                <td>
                  <div className="op-acciones">
                    <button type="button" className="op-action-btn" aria-label={`Editar ${item.descripcion}`} title="Editar" onClick={() => proximamente('Editar servicio')}>
                      <LuPencil className="icon" />
                    </button>
                    <button type="button" className="op-action-btn" aria-label={`Ver detalle de ${item.descripcion}`} title="Detalle" onClick={() => proximamente('Detalle del servicio')}>
                      <LuClipboardList className="icon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Previsualización de la orden seleccionada (panel derecho de la pestaña
// Órdenes médicas): encabezado "ORDEN MEDICA - autor - fecha", botón Copiar
// y una sección por cada tipo de servicio que tenga la orden. Copiar/editar/
// detalle todavía no hacen nada (flujo en desarrollo) — solo avisan con toast.
export default function OrdenPreview({ orden }) {
  const secciones = SECCIONES_ORDEN.filter((s) => orden[s.clave]?.length > 0);

  return (
    <div className="op-preview">
      <div className="op-header">
        <h3 className="op-title">
          <span className="op-title-tipo">{orden.tituloNota}</span>
          <span className="op-title-rest"> - {orden.autor} - {orden.fechaProgramada ?? 'SIN FECHA'}</span>
        </h3>
        <Button variant="outline" size="sm" icon={LuCopy} onClick={() => proximamente('Copiar orden')}>
          Copiar
        </Button>
      </div>

      {secciones.map((s) => (
        <SeccionServicios key={s.clave} titulo={s.titulo} icon={s.icon} tono={s.tono} items={orden[s.clave]} />
      ))}
    </div>
  );
}
