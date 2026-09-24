'use client';

import './OrdenBuilderTabla.css';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import {
  LuCopy, LuFlaskConical, LuFolder, LuTrash2,
} from 'react-icons/lu';

// Accesos del encabezado de la orden (encargo explícito, ver referencia):
// cargar ítems desde una agrupación o un protocolo guardado, o copiar una
// orden anterior. Todavía sin flujo propio — toast placeholder, mismo patrón
// que "Recetario por voz" en ItemFormPanel.jsx.
const ACCIONES_ORDEN = [
  { id: 'agrupaciones', label: 'Agrupaciones', icon: LuFolder },
  { id: 'protocolos', label: 'Protocolos', icon: LuFlaskConical },
  { id: 'copiar', label: 'Copiar', icon: LuCopy },
];

const COLUMNAS = [
  'Descripción', 'Dosis', 'Unidad de medida', 'Presentación', 'Vía',
  'Frecuencia', 'Duración', 'Cant.', 'Prioritario', 'Observaciones', 'Acciones',
];
const CAMPOS_DOSIS = ['dosis', 'unidad', 'presentacion', 'via', 'frecuencia', 'duracion'];

// Panel derecho de "Iniciar nueva orden": una tabla por categoría con ítems
// ya cargados desde ItemFormPanel — mismas columnas/celdas "-" para
// dosificación que OrdenPreview.jsx (previsualización de una orden ya
// guardada), pero con un botón "Quitar" en vez de editar/detalle: acá la
// orden todavía se está armando, no hay nada que editar en el lugar.
export default function OrdenBuilderTabla({ ordenItems, secciones, onQuitar }) {
  const seccionesConItems = secciones.filter((s) => (ordenItems[s.clave]?.length ?? 0) > 0);

  return (
    <div className="obt-panel">
      <div className="obt-header">
        <h3 className="obt-title">ORDEN MÉDICA</h3>
        <div className="obt-header-actions">
          {ACCIONES_ORDEN.map((a) => (
            <Button
              key={a.id}
              variant="secondary-accent"
              size="sm"
              icon={a.icon}
              onClick={() => window.ncToast?.(`${a.label} (flujo en desarrollo).`)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      </div>

      {seccionesConItems.length === 0 ? (
        <p className="obt-empty">No hay ítems en la orden. Agregue ítems desde el formulario.</p>
      ) : (
        seccionesConItems.map((s) => (
          <section key={s.clave} className="obt-section">
            <div className="obt-section-head">
              <span className={`obt-section-icon ${s.tono}`}><s.icon className="icon" aria-hidden="true" /></span>
              <h4 className="obt-section-title">{s.titulo}</h4>
              <Badge tone="neutral" className="obt-count">
                {ordenItems[s.clave].length} {ordenItems[s.clave].length === 1 ? 'item' : 'items'}
              </Badge>
            </div>

            <div className="obt-table-wrap">
              <table className="obt-table">
                <thead>
                  <tr>{COLUMNAS.map((c) => <th key={c}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {ordenItems[s.clave].map((item) => (
                    <tr key={item.id}>
                      <td className="obt-desc">{item.descripcion}</td>
                      {CAMPOS_DOSIS.map((campo) => (
                        item[campo]
                          ? <td key={campo}>{item[campo]}</td>
                          : <td key={campo} className="obt-na">-</td>
                      ))}
                      <td>{item.cantidad || '-'}</td>
                      <td>{item.prioritario ? 'Sí' : 'No'}</td>
                      <td>{item.observaciones || '-'}</td>
                      <td>
                        <button
                          type="button"
                          className="obt-quitar-btn"
                          aria-label={`Quitar ${item.descripcion}`}
                          title="Quitar"
                          onClick={() => onQuitar(s.clave, item.id)}
                        >
                          <LuTrash2 className="icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
