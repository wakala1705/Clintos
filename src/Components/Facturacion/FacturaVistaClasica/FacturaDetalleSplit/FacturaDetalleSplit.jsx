'use client';

import './FacturaDetalleSplit.css';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import FacturaItemsTable from '../FacturaItemsTable/FacturaItemsTable';
import FacturaItemResumen from '../FacturaItemResumen/FacturaItemResumen';
import { formatCOP, formatFechaClasica } from '@/hooks/Facturacion/mockFacturasData';
import useFacturaItemSeleccion from '@/hooks/Facturacion/useFacturaItemSeleccion';
import {
  CLASE_LABEL, ESTADO_FACTURACION, TIPO_LABEL,
} from '@/hooks/Facturacion/facturaDetalleLabels';
import {
  LuBuilding2, LuFileText, LuPrinter, LuTriangleAlert,
} from 'react-icons/lu';

function Meta({ label, children }) {
  return (
    <span className="fds-meta">
      <span className="fds-meta-label">{label}</span>
      <span className="fds-meta-value">{children}</span>
    </span>
  );
}

// Panel inferior del modo "Dividida" de la vista clásica: los mismos datos
// que el modal "Ver detalle" (FacturaDetalleModalClasico), en versión
// compacta para caber en ~50% del alto de pantalla (encargo explícito):
//
// - Encabezado de 2 líneas en vez de identidad + tarjeta de 3 grupos: línea 1
//   con factura/estado/pagador, acciones de documento y Valor total; línea 2
//   solo con lo que NO muestra la grilla de arriba (afiliado/ID/admisión y
//   sede/usuario/procedencia, encargo explícito) -- fechas, F.Elect, estado
//   de envío, Estado FE y documento ya son columnas de esa grilla, repetirlos
//   acá era redundante. Pares etiqueta/valor en línea (envuelven si no
//   entran).
// - Anulada: aviso de una sola línea en vez de la tarjeta del modal.
// - Cuerpo: tabla de ítems CON las columnas de valores (IVA/Copago/
//   Moderador/Pago compartido/Descuento, `showValores`) + FacturaItemResumen
//   solo con la trazabilidad del ítem seleccionado (`soloTrazabilidad`),
//   encargo explícito. Mismo comportamiento de selección que el modal
//   (useFacturaItemSeleccion).
// - "Facturar" va en el encabezado (no hay footer) y se aplica directo: el
//   cambio del badge aquí y en la grilla de arriba ya es la confirmación, no
//   hace falta el toast + cierre del modal.
export default function FacturaDetalleSplit({ factura, onFacturar }) {
  const {
    selectedItemId, selectedIndex, selectedItem, toggleSelectedItem, resumen,
  } = useFacturaItemSeleccion(factura);

  if (!factura) {
    return (
      <div className="fds-empty">
        <LuFileText className="icon" aria-hidden="true" />
        Selecciona una factura para ver su detalle
      </div>
    );
  }

  const estadoFacturacion = ESTADO_FACTURACION[factura.estadoFacturacion];

  return (
    <section className="fds" aria-label={`Detalle de la factura ${factura.numero}`}>
      <header className="fds-header">
        <div className="fds-header-top">
          <div className="fds-identity">
            <h2 className="fds-title">Factura {factura.numero}</h2>
            <Badge tone={estadoFacturacion.tone}>{estadoFacturacion.label}</Badge>
            <span className="fds-sub">
              {factura.terceroRazonSocial} · {factura.tipoContrato} · {TIPO_LABEL[factura.tipo]} · {CLASE_LABEL[factura.clase]}
            </span>
          </div>

          <div className="fds-actions">
            <Button variant="secondary-accent" size="sm" icon={LuPrinter}>Imprimir anexo</Button>
            <Button variant="secondary-accent" size="sm" icon={LuFileText}>Anexo por prefijo</Button>
            <Button variant="secondary-accent" size="sm" icon={LuBuilding2}>Capitados</Button>
            {factura.estadoFacturacion === 'pendiente' && (
              <Button variant="primary" size="sm" onClick={() => onFacturar(factura.id)}>Facturar</Button>
            )}
          </div>

          <div className="fds-total">
            <span className="fds-meta-label">Valor total</span>
            <span className="fds-total-value">{formatCOP(factura.valorTotal)}</span>
          </div>
        </div>

        <div className="fds-meta-row">
          <span className="fds-meta-group">
            <span className="fds-patient">{factura.nombreAfiliado}</span>
            <Meta label="ID">{factura.idAfiliado}</Meta>
            <Meta label="Adm.">{factura.noAdmision}</Meta>
          </span>
          <span className="fds-meta-group">
            <Meta label="Sede">{factura.sedeCodigo}</Meta>
            <Meta label="Usuario">{factura.usuario}</Meta>
            <Meta label="Proc.">{factura.procedencia}</Meta>
          </span>
        </div>
      </header>

      {factura.estado === 'anulada' && (
        <div className="fds-anulada" role="note">
          <LuTriangleAlert className="icon" aria-hidden="true" />
          <span>
            <strong>Factura anulada:</strong> {factura.motivoAnulacion}
            <span className="fds-anulada-meta"> · {factura.anuladaPor} · {formatFechaClasica(factura.fechaAnulacion)}, {factura.horaAnulacion}</span>
          </span>
        </div>
      )}

      <div className="fds-body">
        <div className="fvc-items-card">
          <div className="fvc-items-body">
            <FacturaItemsTable items={factura.items} selectedId={selectedItemId} onSelect={toggleSelectedItem} showValores />
          </div>
        </div>
        <div className="fds-side">
          <FacturaItemResumen selectedItem={selectedItem} selectedIndex={selectedIndex} resumen={resumen} soloTrazabilidad />
        </div>
      </div>
    </section>
  );
}
