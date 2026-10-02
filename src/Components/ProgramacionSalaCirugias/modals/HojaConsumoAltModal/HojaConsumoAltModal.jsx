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
import { ahoraDemo, fechaHoraLocalISO, registrarConsumo } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { planRegistroConsumo } from '@/hooks/ProgramacionSalaCirugias/cierre/cierre';

// Sin sesión real en el prototipo: el mismo usuario que ya firma la recepción en Canastas.
const USUARIO = 'Camilo Grondona';

// Versión alternativa de la hoja de consumo (ver HojaConsumoModal): contexto en una barra,
// formulario a la izquierda e insumos a la derecha. Comparte datos guardados con la otra.
// "Registrar consumo" es UNA sola acción: guarda la hoja, registra el consumo de la canasta y genera
// al instante la devolución a farmacia de lo no consumido (ver planRegistroConsumo). Se puede usar con
// consumo parcial; se bloquea si algún insumo excede lo entregado o si la cirugía aún no está realizada
// con la canasta recibida.
export default function HojaConsumoAltModal({ cirugia, onClose, onConsumoRegistrado }) {
  const [hoja, setHoja] = useState(() => obtenerHojaConsumo(cirugia.id) ?? construirHojaConsumo(cirugia));
  const hayExceso = materialesConExceso(hoja.materiales).length > 0;
  const plan = planRegistroConsumo(cirugia, hoja.materiales);
  const [error, setError] = useState('');
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
    if (hayExceso || plan.bloqueo) return;
    // Primero el consumo de la canasta (puede fallar): si falla no queda la hoja a medias.
    let actualizada = null;
    let devolucion = null;
    if (plan.generaDevolucion) {
      try {
        const antes = cirugia.devoluciones?.length ?? 0;
        actualizada = registrarConsumo(cirugia.id, { usados: plan.usados, usuario: USUARIO });
        devolucion = (actualizada.devoluciones?.length ?? 0) > antes ? actualizada.devoluciones.at(-1) : null;
      } catch (e) {
        setError(e.message);
        return;
      }
    }
    guardarHojaConsumo({ ...hoja, estado: 'registrada', registradaEn: fechaHoraLocalISO(ahoraDemo()) });
    if (actualizada) onConsumoRegistrado?.(actualizada, devolucion);
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

  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  let mensaje;
  if (error) mensaje = error;
  else if (hayExceso) mensaje = 'Hay insumos con consumo mayor a lo entregado. Corrígelos para continuar.';
  else if (plan.bloqueo) mensaje = plan.bloqueo;
  else if (plan.yaRegistrado) mensaje = 'El consumo de la canasta ya estaba registrado: al registrar solo se guarda la hoja.';
  else {
    const devolver = plan.unidades > 0
      ? `se generará la devolución a farmacia: ${plural(plan.unidades, 'unidad', 'unidades')} en ${plural(plan.insumos, 'insumo', 'insumos')}.`
      : 'no hay insumos por devolver a farmacia.';
    const sinDato = plan.sinDato > 0
      ? ` ${plural(plan.sinDato, 'insumo de la canasta no está', 'insumos de la canasta no están')} en la hoja y se registran como usados.`
      : '';
    mensaje = `Al registrar, ${devolver}${sinDato} La hoja queda disponible para firma de farmacia.`;
  }

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
            <Button icon={LuCheck} disabled={hayExceso || plan.bloqueo !== null} onClick={registrar}>Registrar consumo</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
