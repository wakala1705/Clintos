'use client';

import { useEffect } from 'react';
import './FacturaDetalleModalClasico.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import FacturaItemsTable from '../FacturaItemsTable/FacturaItemsTable';
import { formatCOP, formatFechaClasica } from '@/hooks/Facturacion/mockFacturasData';
import { LuBuilding2, LuFileText, LuPrinter } from 'react-icons/lu';

const TIPO_LABEL = { individual: 'Individual', capitada: 'Capitada' };
const CLASE_LABEL = { salud: 'Salud', particular: 'Particular' };

// 3 estados del flujo de facturación electrónica -- ver mismo mapa en
// FacturasGridClasica.jsx (duplicado a propósito, mismo criterio que
// TIPO_LABEL/CLASE_LABEL de arriba).
const ESTADO_PE = {
  pendiente: { label: 'Pendiente', tone: 'neutral' },
  'fe-pendiente': { label: 'Factura electrónica pendiente', tone: 'warn' },
  enviada: { label: 'Enviada', tone: 'success' },
};

// Columna "Estado" (P/A) del formulario legacy -- ver mismo helper en
// FacturasGridClasica.jsx (duplicado a propósito, mismo criterio que
// ESTADO_PE de arriba).
function estadoFacturaBadge(f) {
  return f.estado === 'anulada'
    ? { label: 'Anulada', tone: 'danger' }
    : { label: 'Pagada', tone: 'success' };
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
// compartida con el panel inferior FacturaDetalleClasico) al final. Modal
// extragrande (.fvcd-modal, ver su CSS) para que esa tabla de 14 columnas no
// quede apretada. El resto de los campos de la ficha van en una sola franja
// compacta (.fvcd-compact-fields, agrupados con separadores verticales en
// vez de los 5 bloques con título propio de antes) para dejarle el
// protagonismo visual a la tabla de ítems (encargo explícito). ModalHeader
// queda con un título genérico ("Detalle de factura", sin ícono/subtítulo)
// -- el número de factura + tercero (antes title/subtitle del header) bajan
// a fvcd-identity-row con su propio ícono en círculo (.fvcd-factura-icon,
// mismo patrón visual que .modal-header-icon), junto a la identificación del
// afiliado (nombre/ID/No. Admisión) que ya vivía ahí (encargo explícito).
// Imprimir anexo/Anexo por prefijo/Capitados viven en el footer de la
// tarjeta de ítems (fvcd-items-footer) -- trasladados acá desde el footer
// de FacturaDetalleClasico (encargo explícito, ya no se duplican en los dos
// lugares). `factura` null = cerrado, mismo patrón que AdmisionDetalleModal.
export default function FacturaDetalleModalClasico({ factura, onClose }) {
  useEffect(() => {
    if (!factura) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [factura, onClose]);

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
              <div className="fvcd-identity-name">Factura {factura.numero}</div>
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

            <Field label="C" value="0" />
            <Field label="F.Elect FE" value={factura.flagFE ? 'Sí' : 'No'} />
            <Field label="Estado">
              <Badge tone={estadoFacturaBadge(factura).tone} className="fvcd-badge">{estadoFacturaBadge(factura).label}</Badge>
            </Field>
            <Field label="PE">
              <Badge tone={ESTADO_PE[factura.estadoPE].tone} className="fvcd-badge">{ESTADO_PE[factura.estadoPE].label}</Badge>
            </Field>

            <div className="fvcd-compact-divider" aria-hidden="true" />

            <Field label="Administradora Afi" value={factura.terceroId} />
            <Field label="Usuario" value={factura.usuario} />
            <Field label="Procedencia" value={factura.procedencia} />
          </div>

          <div className="fvcd-items-card">
            <div className="fvcd-items-header">Ítems ({factura.items.length})</div>
            <div className="fvcd-items-body">
              <FacturaItemsTable items={factura.items} />
            </div>
            <div className="fvcd-items-footer">
              <Button variant="secondary-accent" size="sm" icon={LuPrinter}>Imprimir anexo</Button>
              <Button variant="secondary-accent" size="sm" icon={LuFileText}>Anexo por prefijo</Button>
              <Button variant="secondary-accent" size="sm" icon={LuBuilding2}>Capitados</Button>
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
