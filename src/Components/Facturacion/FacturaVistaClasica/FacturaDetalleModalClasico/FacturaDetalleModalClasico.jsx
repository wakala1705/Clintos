'use client';

import { useEffect, useMemo, useState } from 'react';
import './FacturaDetalleModalClasico.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import FacturaItemsTable from '../FacturaItemsTable/FacturaItemsTable';
import { formatCOP, formatFechaClasica } from '@/hooks/Facturacion/mockFacturasData';
import {
  LuBuilding2, LuCheck, LuFileText, LuPrinter, LuTriangleAlert,
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
  pendiente: { label: 'Pendiente', tone: 'warn' },
  'fe-pendiente': { label: 'Pendiente de correo', tone: 'warn' },
  enviada: { label: 'Enviada', tone: 'success' },
};

// Columna "Facturación" -- ver mismo mapa en FacturasGridClasica.jsx
// (duplicado a propósito, mismo criterio que ESTADO_PE de arriba).
const ESTADO_FACTURACION = {
  pendiente: { label: 'Pendiente', tone: 'warn' },
  facturada: { label: 'Facturada', tone: 'success' },
};

// Columna "Estado FE" (P/A) del formulario legacy -- ver mismo helper en
// FacturasGridClasica.jsx (duplicado a propósito, mismo criterio que
// ESTADO_PE de arriba): solo 2 estados (encargo), 'pendiente-electronica'
// colapsa junto con null en "Procesada".
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
// badge junto al número de factura es el de Facturación (ESTADO_FACTURACION)
// -- el de PE (ESTADO_PE, "Estado de envío") vive dentro de
// fvcd-compact-fields (entre F.Elect FE y Estado FE, mismo orden que la
// grilla), no acá (encargo explícito). Valor Total (antes acá, en
// fvcd-identity-row, y después probado en el footer de fvcd-items-card)
// terminó de mudarse a fvcd-compact-fields como su propio grupo al final
// (encargo explícito, ver ese bloque más abajo) -- mejor ubicado ahí,
// junto al resto de los datos de la factura, que en un header/footer.
//
// La tabla de ítems y el resumen van en 2 columnas dentro de una sola fila
// (fvcd-detail-row, encargo explícito: "ganamos
// espacio [al sacar columnas redundantes de la tabla], que quede en un solo
// bloque en vez de alargar la modal") -- a la izquierda fvcd-detail-main
// (la tarjeta de ítems, con Imprimir anexo/Anexo por prefijo/Capitados como
// footer propio de esa tarjeta, .fvcd-items-footer -- trasladados acá desde
// el footer de FacturaDetalleClasico, ya no se duplican en los dos lugares);
// a la derecha de fvcd-detail-row va fvcd-bottom-summary, 2 tarjetas
// apiladas -- "Resumen de factura" e "Información adicional" (CCosto/Tabla
// Origen/ID Item Prestación/FTRDID, encargo explícito: bajaron acá desde la
// tabla de ítems -- FacturaItemsTable ya no las pinta como columna propia,
// ver ese archivo -- los 4 son datos por ítem, no de la factura, así que
// siguen la selección de la tabla igual que ya hacía CCosto, "—" sin ítem
// seleccionado). "Administradora Afi" vivió acá -- encargo explícito la
// ocultó del todo, sin reemplazo. Usuario/Procedencia vivieron acá en algún
// momento -- encargo explícito los subió de vuelta a fvcd-compact-fields
// (grupo de identificación, junto a Documento/Tipo Contrato/Tipo Factura/
// Clase/Sede), así que ya no se repiten en esta tarjeta. La columna "C" de
// FacturasGridClasica (su significado nunca quedó claro, sin campo real de
// `factura` detrás, solo el valor fijo '0' que ya mostraba la grilla) vivió
// brevemente acá como campo propio de fvcd-compact-fields -- se ocultó del
// todo (encargo explícito), no hay reemplazo. La columna "F" ya no vive acá: volvió a la grilla con significado real
// ("Facturación", ver ESTADO_FACTURACION arriba) -- este modal la refleja
// como el badge junto al número de factura en fvcd-identity-row (no dentro
// de fvcd-compact-fields), mismo criterio de duplicado a propósito entre
// grilla y detalle que Estado de envío/Estado FE.
//
// Cada fila de la tabla de ítems es seleccionable (encargo explícito, clic o
// Enter/Espacio, mismo patrón accesible que las filas de FacturasGridClasica).
// El primer ítem viene seleccionado por defecto (encargo explícito) --
// "Resumen de factura"/CCosto arrancan mostrando los datos de ese ítem, no
// el agregado de todos; clic de nuevo sobre la fila seleccionada la
// deselecciona y `resumen` vuelve a agregar TODOS los ítems (toggle, ver
// `toggleSelectedItem`). Selección por `id` estable del ítem (ver buildItems
// en mockFacturasData.js), no por índice del array -- FacturaItemsTable ya
// lo espera así independientemente de si hay algo más arriba filtrando
// `items`. `factura` null = cerrado, mismo patrón que AdmisionDetalleModal.
//
// fvcd-anulada-card (encargo explícito) -- solo cuando `factura.estado ===
// 'anulada'`, entre fvcd-compact-fields y fvcd-detail-row (nunca deja hueco
// vacío: es un `&&` condicional, no un contenedor con altura fija oculto).
// Motivo/quién/cuándo son campos nuevos del mock (motivoAnulacion/
// anuladaPor/fechaAnulacion/horaAnulacion en mockFacturasData.js), solo
// presentes en facturas ya generadas como 'anulada' -- mismo criterio que
// `hora` en mockSolicitudesData.js (string literal, no Date real).
//
// Acción principal "Facturar" en el footer (encargo) -- solo visible cuando
// `factura.estadoFacturacion === 'pendiente'` (ver ESTADO_FACTURACION
// arriba); pasa la factura a "Facturada" vía `onFacturar(factura.id)`, que
// el padre (FacturaVistaClasica) aplica como override local, mismo patrón
// que `estadoPEOverrides`/handleImprimir para "enviada". No aparece en
// absoluto si la factura ya está "Facturada" -- no es un botón
// deshabilitado, se oculta del todo.
export default function FacturaDetalleModalClasico({ factura, onClose, onFacturar }) {
  const [selectedItemId, setSelectedItemId] = useState(factura?.items[0]?.id ?? null);
  // Acción principal "Facturar" (encargo: solo visible con
  // `factura.estadoFacturacion === 'pendiente'`, ver footer más abajo) --
  // mismo patrón "toast + delay antes de cerrar" que Guardar en
  // FacturaAgregarModalClasico/FacturaEditarModalClasico (`fvc-save-toast`,
  // compartida en shared.css). Bloquea el cierre (Escape/overlay/botón X/
  // "Cerrar") mientras está en curso, mismo criterio que `saving` en esos
  // modales.
  const [facturando, setFacturando] = useState(false);

  function handleClose() {
    if (facturando) return;
    onClose();
  }

  function handleFacturar() {
    if (facturando) return;
    setFacturando(true);
    setTimeout(() => {
      onFacturar(factura.id);
      onClose();
    }, 1100);
  }

  useEffect(() => {
    if (!factura) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  // Selecciona el primer ítem por defecto al cambiar de factura (o cerrar el
  // modal) -- evita que quede una selección de la factura anterior aplicada
  // silenciosamente la próxima vez que se abra este mismo modal (encargo
  // explícito: primer ítem seleccionado por defecto, no "sin selección").
  const [lastFacturaId, setLastFacturaId] = useState(factura?.id ?? null);
  if ((factura?.id ?? null) !== lastFacturaId) {
    setLastFacturaId(factura?.id ?? null);
    setSelectedItemId(factura?.items[0]?.id ?? null);
  }

  function toggleSelectedItem(id) {
    setSelectedItemId((cur) => (cur === id ? null : id));
  }

  // CCosto/Tabla Origen/ID Item Prestación/FTRDID son datos por ítem (ver
  // mockFacturasData.js), no de la factura -- se muestran en "Información
  // adicional" atados a la selección de la tabla, mismo criterio que
  // "Resumen de factura" (sin ítem seleccionado, "—").
  const selectedItem = factura?.items.find((it) => it.id === selectedItemId) ?? null;

  // Sin ítem seleccionado (deseleccionado a mano), agrega TODOS los ítems;
  // con un ítem seleccionado (el primero, por defecto), se acota a ese único
  // ítem (ver comentario del componente).
  const resumen = useMemo(() => {
    if (!factura) return null;
    const itemsResumen = selectedItemId
      ? factura.items.filter((it) => it.id === selectedItemId)
      : factura.items;
    const totales = itemsResumen.reduce((acc, it) => ({
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
      totalItems: itemsResumen.length,
      total: totales.subtotalServicios + totales.iva + totales.copago + totales.moderador + totales.pagoCompartido - totales.descuento,
    };
  }, [factura, selectedItemId]);

  if (!factura) return null;

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="modal fvcd-modal" role="dialog" aria-modal="true" aria-labelledby="fvcd-title">
        <ModalHeader
          title="Detalle de factura"
          titleId="fvcd-title"
          onClose={handleClose}
        />

        <div className="modal-body">
          {facturando && (
            <div className="fvc-save-toast" role="status" aria-live="polite">
              <LuCheck className="icon" aria-hidden="true" />
              Factura marcada como facturada (simulado) — no persiste todavía en el servidor.
            </div>
          )}

          <div className="fvcd-identity-row">
            <div className="fvcd-factura-icon">
              <LuFileText className="icon" aria-hidden="true" />
            </div>
            <div className="fvcd-identity-text">
              <div className="fvcd-identity-name">
                Factura {factura.numero}
                <Badge tone={ESTADO_FACTURACION[factura.estadoFacturacion].tone} className="fvcd-badge">{ESTADO_FACTURACION[factura.estadoFacturacion].label}</Badge>
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
          </div>

          <div className="fvcd-compact-fields">
            <Field label="Documento" value={factura.documento} />
            <Field label="Tipo Contrato" value={factura.tipoContrato} />
            <Field label="Tipo Factura" value={TIPO_LABEL[factura.tipo]} />
            <Field label="Clase" value={CLASE_LABEL[factura.clase]} />
            <Field label="Sede" value={factura.sedeCodigo} />
            <Field label="Usuario" value={factura.usuario} />
            <Field label="Procedencia" value={factura.procedencia} />

            <div className="fvcd-compact-divider" aria-hidden="true" />

            <Field label="F. Factura" value={formatFechaClasica(factura.fecha)} />
            <Field label="F. Vencimiento" value={formatFechaClasica(factura.fechaVencimiento)} />

            <div className="fvcd-compact-divider" aria-hidden="true" />

            <Field label="F.Elect FE" value={factura.flagFE ? 'Sí' : 'No'} />
            <Field label="Estado de envío">
              <Badge tone={ESTADO_PE[factura.estadoPE].tone} className="fvcd-badge">{ESTADO_PE[factura.estadoPE].label}</Badge>
            </Field>
            <Field label="Estado FE">
              <Badge tone={estadoFacturaBadge(factura).tone} className="fvcd-badge">{estadoFacturaBadge(factura).label}</Badge>
            </Field>

            <div className="fvcd-compact-divider" aria-hidden="true" />

            <Field label="Valor Total">
              <span className="fvcd-total-value">{formatCOP(factura.valorTotal)}</span>
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
                <div className="fvcd-items-body">
                  <FacturaItemsTable items={factura.items} selectedId={selectedItemId} onSelect={toggleSelectedItem} />
                </div>
                <div className="fvcd-items-footer">
                  <Button variant="secondary-accent" size="sm" icon={LuPrinter}>Imprimir anexo</Button>
                  <Button variant="secondary-accent" size="sm" icon={LuFileText}>Anexo por prefijo</Button>
                  <Button variant="secondary-accent" size="sm" icon={LuBuilding2}>Capitados</Button>
                </div>
              </div>
            </div>

            <div className="fvcd-bottom-summary">
              <div className="fvcd-summary-card">
                <div className="fvcd-summary-title">Resumen de factura</div>
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
                <div className="fvcd-summary-row"><span>CCosto</span><span>{selectedItem?.ccosto ?? '—'}</span></div>
                <div className="fvcd-summary-row"><span>Tabla Origen</span><span>{selectedItem?.tablaOrigen ?? '—'}</span></div>
                <div className="fvcd-summary-row"><span>ID Item Prestación</span><span>{selectedItem ? selectedItem.idItemPrestacion.toLocaleString('es-CO') : '—'}</span></div>
                <div className="fvcd-summary-row"><span>FTRDID</span><span>{selectedItem ? selectedItem.ftrdid.toLocaleString('es-CO') : '—'}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={handleClose} disabled={facturando}>Cerrar</Button>
          {factura.estadoFacturacion === 'pendiente' && (
            <Button variant="primary" onClick={handleFacturar} disabled={facturando}>Facturar</Button>
          )}
        </div>
      </div>
    </div>
  );
}
