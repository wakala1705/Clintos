'use client';

import { LuBan, LuPlus, LuTrash2 } from 'react-icons/lu';
import './ExcepcionItem.css';
import { ETIQUETA_TIPO } from '@/hooks/AgendaCirujanos/excepciones';
import { rangoExcepcionLabel } from '@/hooks/AgendaCirujanos/formato';

// Una excepción de la lista: ícono por tipo (bloqueo rojo / apertura verde),
// motivo, fechas y franja, nota y botón de eliminar. `pasada` la atenúa.
export default function ExcepcionItem({ excepcion, pasada, onEliminar }) {
  const esBloqueo = excepcion.tipo === 'bloqueo';
  const Icono = esBloqueo ? LuBan : LuPlus;
  return (
    <div className={`ac-exc ac-exc-${excepcion.tipo}${pasada ? ' ac-exc-pasada' : ''}`}>
      <div className="ac-exc-icono" aria-hidden="true">
        <Icono className="icon" />
      </div>
      <div className="ac-exc-cuerpo">
        <div className="ac-exc-titulo">{ETIQUETA_TIPO[excepcion.tipo]} · {excepcion.motivo}</div>
        <div className="ac-exc-rango">{rangoExcepcionLabel(excepcion)}</div>
        {excepcion.nota && <div className="ac-exc-nota">{excepcion.nota}</div>}
      </div>
      <button
        type="button"
        className="ncw-icon-btn ncw-icon-btn-danger"
        aria-label={`Eliminar excepción: ${excepcion.motivo}`}
        onClick={onEliminar}
      >
        <LuTrash2 className="icon" aria-hidden="true" />
      </button>
    </div>
  );
}
