'use client';

import { useEffect, useState } from 'react';
import { LuCheck, LuClipboardList } from 'react-icons/lu';
import './HojaConsumoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import PacienteProcedimiento from './PacienteProcedimiento/PacienteProcedimiento';
import EquipoTiempos from './EquipoTiempos/EquipoTiempos';
import MaterialesTabla from './MaterialesTabla/MaterialesTabla';
import FirmasCards from './FirmasCards/FirmasCards';
import {
  construirHojaConsumo, guardarHojaConsumo, materialesConExceso, obtenerHojaConsumo, paqueteDeCirugia,
} from '@/hooks/ProgramacionSalaCirugias/hojaConsumo/hojaConsumo';

const TIPO_BADGE = {
  programado: { tone: 'info', label: 'Programado' },
  emergencia: { tone: 'danger', label: 'Emergencia' },
};

const horaAhora = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// Hoja de consumo · Centro quirúrgico: material entregado por el paquete, consumido y devuelto.
// "Cancelar", la X y Escape descartan lo digitado; "Guardar borrador" y "Registrar consumo"
// guardan en el store en memoria (al reabrir se recupera). Un clic en el fondo no cierra.
export default function HojaConsumoModal({ cirugia, onClose }) {
  const [hoja, setHoja] = useState(() => obtenerHojaConsumo(cirugia.id) ?? construirHojaConsumo(cirugia));
  const [guardadoEn, setGuardadoEn] = useState('');
  const paquete = paqueteDeCirugia(cirugia);
  const hayErrores = materialesConExceso(hoja.materiales).length > 0;
  const badge = TIPO_BADGE[hoja.tipo];
  const set = (clave, valor) => setHoja((h) => ({ ...h, [clave]: valor }));

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  function guardarBorrador() {
    guardarHojaConsumo(hoja);
    setGuardadoEn(horaAhora());
  }

  function registrar() {
    if (hayErrores) return;
    guardarHojaConsumo({ ...hoja, estado: 'registrada' });
    onClose();
  }

  return (
    <div className="modal-overlay open" role="presentation">
      <div
        className="modal-card hco-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hco-title"
      >
        <ModalHeader
          icon={LuClipboardList}
          tone="primary"
          title="Hoja de consumo · Centro quirúrgico"
          titleId="hco-title"
          subtitle={`Material médico de cirugía · Paquete ${paquete.nombre}`}
          onClose={onClose}
          closeLabel="Cerrar hoja de consumo"
          trailing={<Badge tone={badge.tone} dot>{badge.label}</Badge>}
        />

        <div className="modal-body hco-body">
          <PacienteProcedimiento cirugia={cirugia} tipo={hoja.tipo} onTipoChange={(v) => set('tipo', v)} />
          <EquipoTiempos
            equipo={hoja.equipo}
            tiempos={hoja.tiempos}
            onEquipo={(k, v) => set('equipo', { ...hoja.equipo, [k]: v })}
            onTiempos={(k, v) => set('tiempos', { ...hoja.tiempos, [k]: v })}
          />
          <MaterialesTabla materiales={hoja.materiales} onChange={(v) => set('materiales', v)} />
          <FirmasCards equipo={hoja.equipo} registrada={hoja.estado === 'registrada'} />
        </div>

        <div className="modal-footer hco-footer">
          <p className="hco-footer-nota">
            Al registrar, la hoja queda disponible para firma de farmacia.
            {guardadoEn && <span role="status"> Borrador guardado · {guardadoEn}</span>}
          </p>
          <div className="hco-footer-acciones">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button variant="outline" onClick={guardarBorrador}>Guardar borrador</Button>
            <Button icon={LuCheck} disabled={hayErrores} onClick={registrar}>Registrar consumo</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
