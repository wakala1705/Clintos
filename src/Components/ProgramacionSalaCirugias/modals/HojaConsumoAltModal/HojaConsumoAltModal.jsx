'use client';

import { useEffect, useState } from 'react';
import { LuCheck, LuClipboardList, LuLock } from 'react-icons/lu';
import './HojaConsumoAltModal.css';
import { useMediaQuery } from '@/hooks/ProgramacionSalaCirugias/hojaConsumo/useMediaQuery';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import ContextoBarra from './ContextoBarra/ContextoBarra';
import ColumnaFormulario from './ColumnaFormulario/ColumnaFormulario';
import InsumosPanel from './InsumosPanel/InsumosPanel';
import {
  construirHojaConsumo, guardarHojaConsumo, materialesConExceso, obtenerHojaConsumo,
} from '@/hooks/ProgramacionSalaCirugias/hojaConsumo/hojaConsumo';

// Versión alternativa de la hoja de consumo (ver HojaConsumoModal): contexto en una barra,
// formulario a la izquierda e insumos a la derecha. Comparte datos guardados con la otra.
// "Registrar consumo" se puede usar con consumo parcial; solo se bloquea si algún insumo excede lo entregado.
export default function HojaConsumoAltModal({ cirugia, onClose }) {
  const [hoja, setHoja] = useState(() => obtenerHojaConsumo(cirugia.id) ?? construirHojaConsumo(cirugia));
  const hayExceso = materialesConExceso(hoja.materiales).length > 0;
  const set = (clave, valor) => setHoja((h) => ({ ...h, [clave]: valor }));
  const esTablet = useMediaQuery('(max-width:1024px)');

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  function registrar() {
    if (hayExceso) return;
    guardarHojaConsumo({ ...hoja, estado: 'registrada' });
    onClose();
  }

  const formulario = (
    <ColumnaFormulario
      cirugia={cirugia}
      equipo={hoja.equipo}
      tiempos={hoja.tiempos}
      onTiempos={(k, v) => set('tiempos', { ...hoja.tiempos, [k]: v })}
      plegable={esTablet}
    />
  );

  const mensaje = hayExceso
    ? 'Hay insumos con consumo mayor a lo entregado. Corrígelos para continuar.'
    : 'Al registrar, la hoja queda disponible para firma de farmacia.';

  return (
    <div className="modal-overlay open" role="presentation">
      <div className="modal-card hca-card" role="dialog" aria-modal="true" aria-labelledby="hca-title">
        <ModalHeader
          icon={LuClipboardList}
          tone="primary"
          title="Nueva hoja de gasto quirúrgico"
          titleId="hca-title"
          titleAdornment={<Badge tone="neutral">Borrador</Badge>}
          onClose={onClose}
          closeLabel="Cerrar hoja de gasto"
        />

        <ContextoBarra cirugia={cirugia} />

        {/* Desktop: formulario a la izquierda e insumos a la derecha. Tablet: los insumos van primero
            (es la tarea principal) y el formulario queda debajo, plegado en acordeones. */}
        <div className="hca-cuerpo">
          {!esTablet && formulario}
          <InsumosPanel materiales={hoja.materiales} onChange={(v) => set('materiales', v)} />
          {esTablet && formulario}
        </div>

        <div className="modal-footer hca-footer">
          <p className="hca-footer-nota" role="status">
            <LuLock className="icon" aria-hidden="true" />
            {mensaje}
          </p>
          <div className="hca-footer-acciones">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button variant="outline" onClick={() => guardarHojaConsumo(hoja)}>Guardar borrador</Button>
            <Button icon={LuCheck} disabled={hayExceso} onClick={registrar}>Registrar consumo</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
