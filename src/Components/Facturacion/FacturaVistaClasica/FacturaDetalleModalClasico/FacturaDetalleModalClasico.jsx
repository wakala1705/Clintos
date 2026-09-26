'use client';

import { useEffect, useState } from 'react';
import './FacturaDetalleModalClasico.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import FacturaItemsTable from '../FacturaItemsTable/FacturaItemsTable';
import FacturaItemResumen from '../FacturaItemResumen/FacturaItemResumen';
import { formatCOP, formatFechaClasica } from '@/hooks/Facturacion/mockFacturasData';
import useFacturaItemSeleccion from '@/hooks/Facturacion/useFacturaItemSeleccion';
import {
  CLASE_LABEL, ESTADO_FACTURACION, ESTADO_PE, TIPO_LABEL, estadoFacturaBadge,
} from '@/hooks/Facturacion/facturaDetalleLabels';
import {
  LuBuilding2, LuCheck, LuFileText, LuPrinter, LuTriangleAlert,
} from 'react-icons/lu';

function Field({ label, value, children }) {
  return (
    <div className="fvcd-field">
      <span className="fvcd-field-label">{label}</span>
      {children ?? <span className="fvcd-field-value">{value}</span>}
    </div>
  );
}

// Modal de detalle disparado por el botón "Ver detalle" (ícono, columna
// Acciones) de FacturasGridClasica -- vuelca las columnas de la grilla densa
// en formato ficha, más la grilla de ítems (FacturaItemsTable, único
// consumidor). Modal extragrande (.fvcd-modal) para que la tabla no quede
// apretada. Organización (de arriba a abajo):
//
// 1. fvcd-identity-row -- número de factura + badge de Facturación
//    (ESTADO_FACTURACION), pagador · Tipo contrato · Tipo factura · Clase como
//    línea de texto, afiliado (nombre/ID/No. Admisión) en una segunda línea, y
//    Valor total como dato principal a la derecha (.fvcd-hero-total). Es la
//    única aparición del total de la FACTURA: el panel derecho de abajo sigue
//    a la fila seleccionada, así que repetirlo ahí se leía como una
//    contradicción ($2.446.532 arriba vs $900.000 del ítem 001).
// 2. fvcd-compact-fields -- el resto de los metadatos en 3 grupos con título
//    propio (Fechas / Facturación electrónica / Origen) en vez de 13 campos
//    al mismo nivel separados por divisores.
// 3. fvcd-detail-row -- tabla de ítems a la izquierda y panel contextual a la
//    derecha (fvcd-bottom-summary): con fila seleccionada muestra valores +
//    trazabilidad (CCosto/Tabla Origen/ID Item Prestación/FTRDID) de ESE
//    ítem, titulado con su número; sin selección agrega todos los ítems y se
//    titula "Resumen de factura". "Administradora Afi" y la columna "C" de la
//    grilla siguen ocultas (encargo explícito, sin reemplazo).
// 4. Footer -- Imprimir anexo/Anexo por prefijo/Capitados a la izquierda
//    (actúan sobre toda la factura, no sobre la tabla), Cerrar/Facturar a la
//    derecha.
//
// Cada fila de la tabla de ítems es seleccionable (clic o Enter/Espacio);
// selección y resumen salen de useFacturaItemSeleccion (compartido con el
// panel del modo dividido, ver ese hook). `factura` null = cerrado, mismo
// patrón que DetalleAdmisionModal en Admisiones.jsx.
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
  const {
    selectedItemId, selectedIndex, selectedItem, toggleSelectedItem, resumen,
  } = useFacturaItemSeleccion(factura);
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

          {/* Encabezado: identidad de la factura (con Tipo contrato/Tipo
              factura/Clase como línea de texto bajo el pagador) + afiliado, y
              Valor total como dato principal a la derecha -- única aparición
              del total de la factura en el modal (el panel derecho sigue a
              la fila seleccionada, ver fvcd-bottom-summary). */}
          <div className="fvcd-identity-row">
            <div className="fvcd-factura-icon">
              <LuFileText className="icon" aria-hidden="true" />
            </div>
            <div className="fvcd-identity-text">
              <div className="fvcd-identity-name">
                Factura {factura.numero}
                <Badge tone={ESTADO_FACTURACION[factura.estadoFacturacion].tone} className="fvcd-badge">{ESTADO_FACTURACION[factura.estadoFacturacion].label}</Badge>
              </div>
              <div className="fvcd-identity-sub">
                {factura.terceroRazonSocial} · {factura.tipoContrato} · {TIPO_LABEL[factura.tipo]} · {CLASE_LABEL[factura.clase]}
              </div>
              <div className="fvcd-identity-sub">
                <span className="fvcd-identity-patient">{factura.nombreAfiliado}</span>
                {' '}· ID {factura.idAfiliado} · No. Admisión {factura.noAdmision}
              </div>
            </div>

            <div className="fvcd-hero-total">
              <span className="fvcd-field-label">Valor total</span>
              <span className="fvcd-total-value">{formatCOP(factura.valorTotal)}</span>
            </div>
          </div>

          {/* Metadatos en 3 grupos con título propio (Fechas / Facturación
              electrónica / Origen) en vez de 13 campos al mismo nivel. */}
          <div className="fvcd-compact-fields">
            <section className="fvcd-group" aria-labelledby="fvcd-g-fechas">
              <h4 id="fvcd-g-fechas" className="fvcd-group-title">Fechas</h4>
              <div className="fvcd-group-fields">
                <Field label="F. Factura" value={formatFechaClasica(factura.fecha)} />
                <Field label="F. Vencimiento" value={formatFechaClasica(factura.fechaVencimiento)} />
              </div>
            </section>

            <section className="fvcd-group" aria-labelledby="fvcd-g-fe">
              <h4 id="fvcd-g-fe" className="fvcd-group-title">Facturación electrónica</h4>
              <div className="fvcd-group-fields">
                <Field label="F.Elect FE" value={factura.flagFE ? 'Sí' : 'No'} />
                <Field label="Estado de envío">
                  <Badge tone={ESTADO_PE[factura.estadoPE].tone} className="fvcd-badge">{ESTADO_PE[factura.estadoPE].label}</Badge>
                </Field>
                <Field label="Estado FE">
                  <Badge tone={estadoFacturaBadge(factura).tone} className="fvcd-badge">{estadoFacturaBadge(factura).label}</Badge>
                </Field>
              </div>
            </section>

            <section className="fvcd-group" aria-labelledby="fvcd-g-origen">
              <h4 id="fvcd-g-origen" className="fvcd-group-title">Origen</h4>
              <div className="fvcd-group-fields">
                <Field label="Documento" value={factura.documento} />
                <Field label="Sede" value={factura.sedeCodigo} />
                <Field label="Usuario" value={factura.usuario} />
                <Field label="Procedencia" value={factura.procedencia} />
              </div>
            </section>
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
              <div className="fvc-items-card">
                <div className="fvc-items-body">
                  <FacturaItemsTable items={factura.items} selectedId={selectedItemId} onSelect={toggleSelectedItem} />
                </div>
              </div>
            </div>

            <div className="fvcd-bottom-summary">
              <FacturaItemResumen selectedItem={selectedItem} selectedIndex={selectedIndex} resumen={resumen} />
            </div>
          </div>
        </div>

        {/* Imprimir anexo/Anexo por prefijo/Capitados actúan sobre toda la
            factura, no sobre la tabla -- van a la izquierda del footer, con
            Cerrar/Facturar a la derecha. */}
        <div className="modal-footer fvcd-footer">
          <div className="fvcd-footer-docs">
            <Button variant="secondary-accent" size="sm" icon={LuPrinter}>Imprimir anexo</Button>
            <Button variant="secondary-accent" size="sm" icon={LuFileText}>Anexo por prefijo</Button>
            <Button variant="secondary-accent" size="sm" icon={LuBuilding2}>Capitados</Button>
          </div>
          <Button variant="secondary" onClick={handleClose} disabled={facturando}>Cerrar</Button>
          {factura.estadoFacturacion === 'pendiente' && (
            <Button variant="primary" onClick={handleFacturar} disabled={facturando}>Facturar</Button>
          )}
        </div>
      </div>
    </div>
  );
}
