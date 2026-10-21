'use client';

import { useEffect } from 'react';
import './EntradaDetalleModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import EntradaItemsTable from '../EntradaItemsTable/EntradaItemsTable';
import { unidadesEntrada } from '@/hooks/InsumosFarmacia/entradasAsistenciales';
import { LuPrinter } from 'react-icons/lu';

const ESTADO_LABEL = { confirmada: 'Confirmada', anulada: 'Anulada' };

// 'aaaa-mm-dd' -> 'dd/mm/aaaa'
const formatFecha = (iso) => iso.split('-').reverse().join('/');

function Field({ label, value }) {
  return (
    <div className="mig-field">
      <span className="mig-field-label">{label}</span>
      <span className="mig-field-value">{value}</span>
    </div>
  );
}

// Modal de detalle de una entrada ("Ver detalle" del menú de fila o doble clic), mismo
// patrón que MovimientoDetalleModal de Salidas: resumen de campos + tabla de insumos.
// `entrada` null = cerrado.
export default function EntradaDetalleModal({ entrada, onClose }) {
  useEffect(() => {
    if (!entrada) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [entrada, onClose]);

  if (!entrada) return null;

  return (
    <div className="modal-overlay open" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal ent-detalle-modal" role="dialog" aria-modal="true" aria-labelledby="ent-detalle-title">
        <ModalHeader
          title={`Detalle de la entrada ${entrada.consecutivo}`}
          titleId="ent-detalle-title"
          onClose={onClose}
        />

        <div className="modal-body">
          <div className="mig-resumen">
            <Field label="Estado" value={ESTADO_LABEL[entrada.estado] ?? entrada.estado} />
            <Field label="Consecutivo" value={entrada.consecutivo} />
            <Field label="Fecha" value={formatFecha(entrada.fecha)} />
            <Field label="Hora" value={entrada.hora} />
            <Field label="Origen" value={entrada.origen} />
            <Field label="Referencia" value={entrada.referencia} />
            <Field label="Paciente" value={entrada.paciente} />
            <Field label="Documento" value={entrada.documento} />
            <Field label="Ubicación" value={entrada.ubicacion} />
            <Field label="Registró" value={entrada.usuario} />
            <Field label="Unidades" value={unidadesEntrada(entrada)} />
          </div>

          <h3 className="mig-section-title">Insumos devueltos ({entrada.items.length})</h3>
          <div className="mig-items-card">
            <EntradaItemsTable items={entrada.items} />
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" icon={LuPrinter}>Imprimir</Button>
        </div>
      </div>
    </div>
  );
}
