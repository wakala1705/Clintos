'use client';

import { useEffect } from 'react';
import { LuLock } from 'react-icons/lu';
import './ConfirmarCierreModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { duracionTexto, resumenRegistro } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const CONTEO_LABEL = { correcto: 'Correcto', discrepancia: 'Con discrepancia', pendiente: 'Pendiente' };

export default function ConfirmarCierreModal({ hoja, onConfirmar, onClose }) {
  const r = resumenRegistro(hoja);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const filas = [
    ['Insumos usados', `${r.insumosUnidadesUsadas} unidades en ${r.insumosItems} ítems`],
    ['Medicamentos', r.medicamentos],
    ['Implantes', r.implantes],
    ['Equipos usados', r.equipos],
    ['Conteo quirúrgico', CONTEO_LABEL[r.conteo]],
    ['Duración de cirugía', duracionTexto(r.duraciones.cirugia)],
  ];

  return (
    <div className="modal-overlay open" role="presentation">
      <div className="modal-card ccm-card" role="dialog" aria-modal="true" aria-labelledby="ccm-title">
        <ModalHeader icon={LuLock} tone="warning" title="Cerrar hoja de gasto" titleId="ccm-title" onClose={onClose} />
        <div className="modal-body">
          <dl className="ccm-resumen">
            {filas.map(([k, v]) => (
              <div key={k} className="ccm-fila">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="ccm-texto">Al cerrar, la hoja queda de solo lectura y pasa a liquidación.</p>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" icon={LuLock} onClick={onConfirmar}>Cerrar hoja</Button>
        </div>
      </div>
    </div>
  );
}
