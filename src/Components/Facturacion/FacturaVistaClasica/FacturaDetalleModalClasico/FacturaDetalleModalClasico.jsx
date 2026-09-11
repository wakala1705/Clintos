'use client';

import { useEffect, useMemo, useState } from 'react';
import './FacturaDetalleModalClasico.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import FacturaItemsTable from '../FacturaItemsTable/FacturaItemsTable';
import { formatCOP, formatFechaClasica } from '@/hooks/Facturacion/mockFacturasData';
import {
  LuBuilding2, LuFileText, LuPrinter, LuTriangleAlert,
} from 'react-icons/lu';

const TIPO_LABEL = {
  individual: 'Individual',
  masiva: 'Masiva',
  copago: 'Copago',
  moderadora: 'Moderadora',
  'pago-compartido': 'Pago Compartido',
};
const CLASE_LABEL = { salud: 'Salud', particular: 'Particular' };

// 3 estados del flujo de facturación electrónica -- ver mismo mapa en
// FacturasGridClasica.jsx (duplicado a propósito, mismo criterio que
// TIPO_LABEL/CLASE_LABEL de arriba).
const ESTADO_PE = {
  pendiente: { label: 'Pendiente de impresión', tone: 'neutral' },
  'fe-pendiente': { label: 'Pendiente de envío', tone: 'warn' },
  enviada: { label: 'Enviada', tone: 'success' },
};

// Columna "Estado" (P/A) del formulario legacy -- ver mismo helper en
// FacturasGridClasica.jsx (duplicado a propósito, mismo criterio que
// ESTADO_PE de arriba, incluido el cambio "Pendiente" -> "Procesada"
// tone="info").
function estadoFacturaBadge(f) {
  return f.estado === 'anulada'
    ? { label: 'Anulada', tone: 'danger' }
    : { label: 'Procesada', tone: 'info' };
}

function Field({ label, value, children }) {
  return (
    <div className="fvcd-field">
      <span className="fvcd-field-label">{label}</span>
      {children ?? <span className="fvcd-field-value">{value}</span>}
    </div>
  );
}

// Modal de detalle disparado por el botón "Ver detalle" (ícono, columna
// Acciones) de FacturasGridClasica -- vuelca las 19 columnas de la grilla
// densa en formato ficha (encargo explícito: "todas las columnas pero
// organizadas en modo detalle"), más la grilla de ítems (FacturaItemsTable,
// único consumidor -- FacturaDetalleClasico ya no la usa, ver su propio
// comentario) al final. Modal
// extragrande (.fvcd-modal, ver su CSS) para que esa tabla de 14 columnas no
// quede apretada. El resto de los campos de la ficha van en una sola tarjeta
// compacta (.fvcd-compact-fields, agrupados con separadores verticales en
// vez de los 5 bloques con título propio de antes) para dejarle el
// protagonismo visual a la tabla de ítems (encargo explícito). ModalHeader
// queda con un título genérico ("Detalle de factura", sin ícono/subtítulo)
// -- el número de factura + tercero (antes title/subtitle del header) bajan
// a fvcd-identity-row con su propio ícono en círculo (.fvcd-factura-icon,
// mismo patrón visual que .modal-header-icon), junto a la identificación del
// afiliado (nombre/ID/No. Admisión) que ya vivía ahí (encargo explícito). El
// badge junto al número de factura es el de PE (ESTADO_PE), no el de Estado
// -- Estado (Anulada/Pendiente) sigue viviendo solo dentro de
// fvcd-compact-fields (encargo explícito, ver imagen de referencia).
//
// La tabla de ítems y el resumen van en 2 columnas dentro de una sola fila
// (fvcd-detail-row, encargo explícito: "ganamos
// espacio [al sacar columnas redundantes de la tabla], que quede en un solo
// bloque en vez de alargar la modal") -- a la izquierda fvcd-detail-main
// (la tarjeta de ítems + Imprimir anexo/Anexo por prefijo/Capitados debajo,
// trasladados acá desde el footer de FacturaDetalleClasico, ya no se
// duplican en los dos lugares); a la derecha fvcd-bottom-summary, 2 tarjetas
// apiladas -- "Resumen de factura" e "Información adicional" (Administradora
// Afi/Usuario/Procedencia, encargo explícito: bajaron acá desde
// fvcd-compact-fields -- por eso ya no se repiten ahí, ver ese bloque más
// abajo). El campo "C" de fvcd-compact-fields también se sacó (encargo
// explícito: "no me comunica nada").
//
// Cada fila de la tabla de ítems es seleccionable (encargo explícito, clic o
// Enter/Espacio, mismo patrón accesible que las filas de FacturasGridClasica)
// y "Resumen de factura" responde a esa selección: `resumen` (sumado de los
// ítems seleccionados, no de `factura.items` completo) queda en cero sin
// selección -- no cae a sumar todo, ver hint `fvcd-summary-hint`. Selección
// por `id` estable del ítem (ver buildItems en mockFacturasData.js), no por
// índice del array -- FacturaItemsTable ya lo espera así independientemente
// de si hay algo más arriba filtrando `items`. `factura` null = cerrado, mismo
// patrón que AdmisionDetalleModal.
//
// fvcd-anulada-card (encargo explícito) -- solo cuando `factura.estado ===
// 'anulada'`, entre fvcd-compact-fields y fvcd-detail-row (nunca deja hueco
// vacío: es un `&&` condicional, no un contenedor con altura fija oculto).
// Motivo/quién/cuándo son campos nuevos del mock (motivoAnulacion/
// anuladaPor/fechaAnulacion/horaAnulacion en mockFacturasData.js), solo
// presentes en facturas ya generadas como 'anulada' -- mismo criterio que
// `hora` en mockSolicitudesData.js (string literal, no Date real).
export default function FacturaDetalleModalClasico({ factura, onClose }) {
  const [selectedItemId, setSelectedItemId] = useState(null);

  useEffect(() => {
    if (!factura) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [factura, onClose]);

  // Reinicia la selección de ítems al cambiar de factura (o cerrar el modal)
  // -- evita que quede una selección de la factura anterior aplicada
  // silenciosamente la próxima vez que se abra este mismo modal.
  const [lastFacturaId, setLastFacturaId] = useState(factura?.id ?? null);
  if ((factura?.id ?? null) !== lastFacturaId) {
    setLastFacturaId(factura?.id ?? null);
    if (selectedItemId) setSelectedItemId(null);
  }

  function toggleSelectedItem(id) {
    setSelectedItemId((cur) => (cur === id ? null : id));
  }

  // "Resumen de factura" responde a la selección (encargo explícito): sin
  // ítem seleccionado, todo en cero -- no cae a sumar todos los ítems.
  const resumen = useMemo(() => {
    if (!factura) return null;
    const seleccionados = factura.items.filter((it) => it.id === selectedItemId);
    const totales = seleccionados.reduce((acc, it) => ({
      subtotalServicios: acc.subtotalServicios + it.vlrServicio,
      iva: acc.iva + it.vlrIVA,
      copago: acc.copago + it.vlrCopago,
      moderador: acc.moderador + it.vlrModerador,
      pagoCompartido: acc.pagoCompartido + it.vlrPagComp,
      descuento: acc.descuento + it.descuento,
    }), {
      subtotalServicios: 0, iva: 0, copago: 0, moderador: 0, pagoCompartido: 0, descuento: 0,
    });
    return {
      ...totales,
      totalItems: seleccionados.length,
      total: totales.subtotalServicios + totales.iva + totales.copago + totales.moderador + totales.pagoCompartido - totales.descuento,
    };
  }, [factura, selectedItemId]);

  if (!factura) return null;

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal fvcd-modal" role="dialog" aria-modal="true" aria-labelledby="fvcd-title">
        <ModalHeader
          title="Detalle de factura"
          titleId="fvcd-title"
          onClose={onClose}
        />

        <div className="modal-body">
          <div className="fvcd-identity-row">
            <div className="fvcd-factura-icon">
              <LuFileText className="icon" aria-hidden="true" />
            </div>
            <div className="fvcd-identity-text">
              <div className="fvcd-identity-name">
                Factura {factura.numero}
                <Badge tone={ESTADO_PE[factura.estadoPE].tone} className="fvcd-badge">{ESTADO_PE[factura.estadoPE].label}</Badge>
              </div>
              <div className="fvcd-identity-sub">{factura.terceroRazonSocial}</div>
            </div>

            <div className="fvcd-compact-divider" aria-hidden="true" />

            <div className="fvcd-identity-text">
              <div className="fvcd-identity-name">
                {factura.nombreAfiliado}
                <span className="fvcd-identity-id">ID {factura.idAfiliado}</span>
              </div>
              <div className="fvcd-identity-sub">No. Admisión {factura.noAdmision}</div>
            </div>

            <div className="fvcd-identity-total">
              <span className="fvcd-field-label">Valor Total</span>
              <span className="fvcd-total-value">{formatCOP(factura.valorTotal)}</span>
            </div>
          </div>

          <div className="fvcd-compact-fields">
            <Field label="Documento" value={factura.documento} />
            <Field label="Tipo Contrato" value={factura.tipoContrato} />
            <Field label="Tipo Factura" value={TIPO_LABEL[factura.tipo]} />
            <Field label="Clase" value={CLASE_LABEL[factura.clase]} />
            <Field label="Sede" value={factura.sedeCodigo} />

            <div className="fvcd-compact-divider" aria-hidden="true" />

            <Field label="F. Factura" value={formatFechaClasica(factura.fecha)} />
            <Field label="F. Vencimiento" value={formatFechaClasica(factura.fechaVencimiento)} />

            <div className="fvcd-compact-divider" aria-hidden="true" />

            <Field label="F.Elect FE" value={factura.flagFE ? 'Sí' : 'No'} />
            <Field label="Estado">
              <Badge tone={estadoFacturaBadge(factura).tone} className="fvcd-badge">{estadoFacturaBadge(factura).label}</Badge>
            </Field>
          </div>

          {factura.estado === 'anulada' && (
            <div className="fvcd-anulada-card">
              <div className="fvcd-anulada-icon">
                <LuTriangleAlert className="icon" aria-hidden="true" />
              </div>
              <div className="fvcd-anulada-body">
                <div className="fvcd-anulada-title">Factura anulada</div>
                <div className="fvcd-anulada-motivo-label">Motivo de anulación</div>
                <div className="fvcd-anulada-motivo">{factura.motivoAnulacion}</div>
                <div className="fvcd-anulada-meta">
                  Anulada por {factura.anuladaPor} · {formatFechaClasica(factura.fechaAnulacion)}, {factura.horaAnulacion}
                </div>
              </div>
            </div>
          )}

          <div className="fvcd-detail-row">
            <div className="fvcd-detail-main">
              <div className="fvcd-items-card">
                <div className="fvcd-items-header">Ítems ({factura.items.length})</div>
                <div className="fvcd-items-body">
                  <FacturaItemsTable items={factura.items} selectedId={selectedItemId} onSelect={toggleSelectedItem} />
                </div>
              </div>

              <div className="fvcd-bottom-actions">
                <Button variant="secondary-accent" size="sm" icon={LuPrinter}>Imprimir anexo</Button>
                <Button variant="secondary-accent" size="sm" icon={LuFileText}>Anexo por prefijo</Button>
                <Button variant="secondary-accent" size="sm" icon={LuBuilding2}>Capitados</Button>
              </div>
            </div>

            <div className="fvcd-bottom-summary">
              <div className="fvcd-summary-card">
                <div className="fvcd-summary-title">Resumen de factura</div>
                {!selectedItemId && <div className="fvcd-summary-hint">Selecciona un ítem de la tabla para ver su resumen.</div>}
                <div className="fvcd-summary-row"><span>Total ítems</span><span>{resumen.totalItems}</span></div>
                <div className="fvcd-summary-row"><span>Subtotal servicios</span><span>{formatCOP(resumen.subtotalServicios)}</span></div>
                <div className="fvcd-summary-row"><span>IVA</span><span>{formatCOP(resumen.iva)}</span></div>
                <div className="fvcd-summary-row"><span>Copago</span><span>{formatCOP(resumen.copago)}</span></div>
                <div className="fvcd-summary-row"><span>Moderador</span><span>{formatCOP(resumen.moderador)}</span></div>
                <div className="fvcd-summary-row"><span>Pago compartido</span><span>{formatCOP(resumen.pagoCompartido)}</span></div>
                <div className="fvcd-summary-row"><span>Descuento</span><span>{formatCOP(resumen.descuento)}</span></div>
                <div className="fvcd-summary-divider" aria-hidden="true" />
                <div className="fvcd-summary-row fvcd-summary-total"><span>Valor Total</span><span>{formatCOP(resumen.total)}</span></div>
              </div>

              <div className="fvcd-summary-card">
                <div className="fvcd-summary-title">Información adicional</div>
                <div className="fvcd-summary-row"><span>Administradora Afi</span><span>{factura.terceroId}</span></div>
                <div className="fvcd-summary-row"><span>Usuario</span><span>{factura.usuario}</span></div>
                <div className="fvcd-summary-row"><span>Procedencia</span><span>{factura.procedencia}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}
