'use client';

import { useEffect, useState } from 'react';
import { LuTimer } from 'react-icons/lu';
import './TiempoTranscurrido.css';
import {
  formatoDuracionMin, formatoReloj, segundosTranscurridos,
} from '@/hooks/ProgramacionSalaCirugias/hojaConsumo/hojaConsumo';
import { ahoraDemo } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Contador del tiempo de la operación, debajo de los tres tiempos de la hoja.
// - Sin "Inicio cirugía": invita a registrarlo.
// - Con inicio y sin fin: reloj en vivo (HH:MM:SS) desde el inicio.
// - Con fin: duración total cerrada.
// "Ahora" es el reloj de la pantalla (ahoraDemo) avanzando en tiempo real desde que se abre la
// hoja, así el contador es coherente con las horas de la demo.
export default function TiempoTranscurrido({ inicio, fin, estimadaMin }) {
  const [ahoraSeg, setAhoraSeg] = useState(() => {
    const d = ahoraDemo();
    return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  });
  const enVivo = Boolean(inicio) && !fin;

  useEffect(() => {
    if (!enVivo) return undefined;
    const id = window.setInterval(() => setAhoraSeg((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [enVivo]);

  const seg = segundosTranscurridos(inicio, fin, ahoraSeg);
  // El inicio aún no llegó (hora futura) o el fin es anterior al inicio: no hay un tiempo válido.
  const invalido = seg !== null && seg < 0;

  let estado = 'vacio';
  let valor = '—';
  let leyenda = 'Registra el inicio de cirugía para medir el tiempo.';
  if (invalido) {
    estado = 'invalido';
    leyenda = fin ? 'El fin no puede ser anterior al inicio.' : 'El inicio de cirugía es posterior a la hora actual.';
  } else if (seg !== null && fin) {
    estado = 'cerrado';
    valor = formatoDuracionMin(seg);
    leyenda = `Duración total · ${inicio} – ${fin}`;
  } else if (seg !== null) {
    estado = 'vivo';
    valor = formatoReloj(seg);
    leyenda = `En curso desde las ${inicio}`;
  }

  const estimada = estimadaMin > 0 ? `Estimada ${formatoDuracionMin(estimadaMin * 60)}` : null;
  const excede = estado === 'vivo' && estimadaMin > 0 && seg > estimadaMin * 60;

  return (
    <div className={`tt tt-${estado}`} role="timer" aria-live="off" aria-label="Tiempo transcurrido de la operación">
      <span className="tt-icono" aria-hidden="true"><LuTimer className="icon" /></span>
      <div className="tt-cuerpo">
        <span className="tt-label">Tiempo transcurrido</span>
        <span className="tt-valor">{valor}</span>
        <span className="tt-leyenda">{leyenda}</span>
      </div>
      {estimada && (
        <span className={`tt-estimada${excede ? ' is-excede' : ''}`}>
          {excede ? 'Supera lo estimado · ' : ''}{estimada}
        </span>
      )}
    </div>
  );
}
