'use client';

import { useEffect, useState } from 'react';
import { LuX } from 'react-icons/lu';
import './ListaFamiliares.css';
import {
  SALAS, SEDES, fechaHoraRangoLabel, fechaISO, fetchAgendaRango,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { filasFamiliares, paginar } from '@/hooks/PantallaFamiliares/familiares';

// Sede fija '02' (ver PanelGeneral.jsx): una sola sede por ahora.
const SEDE_ID = '02';
const SALAS_SEDE = SALAS.filter((s) => s.sedeId === SEDE_ID);
const SEDE_LABEL = SEDES.find((s) => s.value === SEDE_ID)?.label.replace(/^\d+\s*-\s*/, '') ?? '';

const FILAS_POR_PAGINA = 7;
const REFRESCO_MS = 5000; // cada cuánto se vuelve a leer el estado
const PAGINA_MS = 10000; // cada cuánto rota la página si hay más de una

// "Pantalla de familiares": lista a pantalla completa, estilo tablero de
// aeropuerto, para proyectar en la sala de espera. Solo muestra código,
// nombre abreviado, hora programada y estado (ver familiares.js) -- sin datos
// clínicos, documento ni sala. Se actualiza sola; con más filas de las que
// caben rota de página. `tema`: 'oscuro' (televisor) o 'claro'. `incrustada`:
// dentro de un modal (ocupa su alto). `onCerrar` agrega el botón de cerrar.
export default function ListaFamiliares({ tema = 'oscuro', incrustada = false, onCerrar = null }) {
  const [cirugias, setCirugias] = useState(null); // null = cargando
  const [ahora, setAhora] = useState(() => new Date());
  const [pagina, setPagina] = useState(0);

  // Lee las cirugías de hoy cada REFRESCO_MS.
  useEffect(() => {
    let cancelado = false;
    function cargar() {
      const hoy = fechaISO(new Date());
      Promise.all(SALAS_SEDE.map((s) => fetchAgendaRango({
        sedeId: SEDE_ID, salaId: s.value, inicio: hoy, fin: hoy,
      }))).then((porSala) => {
        if (!cancelado) setCirugias(porSala.flat());
      });
    }
    cargar();
    const id = window.setInterval(cargar, REFRESCO_MS);
    return () => { cancelado = true; window.clearInterval(id); };
  }, []);

  // Reloj (hora y fecha del encabezado).
  useEffect(() => {
    const id = window.setInterval(() => setAhora(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);

  const filas = filasFamiliares(cirugias ?? []);
  const paginas = paginar(filas, FILAS_POR_PAGINA);
  const total = paginas.length;

  // Rota la página mientras haya más de una.
  useEffect(() => {
    if (total <= 1) return undefined;
    const id = window.setInterval(() => setPagina((p) => p + 1), PAGINA_MS);
    return () => window.clearInterval(id);
  }, [total]);

  const actual = pagina % total;
  const hora = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
  const fechaHora = fechaHoraRangoLabel(fechaISO(ahora), hora);

  return (
    <main className={`pf-screen pf-tema-${tema}${incrustada ? ' pf-incrustada' : ''}`}>
      <header className="pf-header">
        <div>
          <h1 className="pf-title">Estado de las cirugías</h1>
          <p className="pf-subtitle">Sala de espera · {SEDE_LABEL}</p>
        </div>
        <div className="pf-header-end">
          <time className="pf-clock" dateTime={`${fechaISO(ahora)}T${hora}`}>{fechaHora}</time>
          {onCerrar && (
            <button type="button" className="pf-cerrar" onClick={onCerrar} aria-label="Cerrar pantalla de familiares" title="Cerrar">
              <LuX className="icon" aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      <section className="pf-board" aria-label="Cirugías de hoy">
        <div className="pf-row pf-row-head" aria-hidden="true">
          <span>Código</span>
          <span>Paciente</span>
          <span>Hora</span>
          <span>Estado</span>
        </div>

        {cirugias === null ? (
          <p className="pf-empty" role="status">Cargando…</p>
        ) : filas.length === 0 ? (
          <p className="pf-empty" role="status">No hay cirugías en curso en este momento.</p>
        ) : (
          <ul className="pf-list">
            {paginas[actual].map((f) => (
              <li className="pf-row" key={f.id}>
                <span className="pf-codigo">{f.codigo}</span>
                <span className="pf-nombre">{f.nombre}</span>
                <span className="pf-hora">{f.hora}</span>
                <span className={`pf-estado pf-estado-${f.tone}`}>
                  <span className="pf-estado-dot" aria-hidden="true" />
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {total > 1 && (
        <footer className="pf-footer">
          <p className="pf-pagina" aria-label={`Página ${actual + 1} de ${total}`}>
            {Array.from({ length: total }, (_, k) => (
              <span key={k} className={`pf-pagina-dot${k === actual ? ' active' : ''}`} aria-hidden="true" />
            ))}
          </p>
        </footer>
      )}
    </main>
  );
}
