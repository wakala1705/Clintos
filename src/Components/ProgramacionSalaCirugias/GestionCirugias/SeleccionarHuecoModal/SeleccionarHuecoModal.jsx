'use client';

import { useEffect, useRef, useState } from 'react';
import { LuArrowRight } from 'react-icons/lu';
import './SeleccionarHuecoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FranjaPaciente from '../FranjaPaciente/FranjaPaciente';
import AgendaSalas from '../AgendaSalas/AgendaSalas';
import SeccionFechaSala from '../SeccionFechaSala/SeccionFechaSala';
import AvisoAdmision from '../AvisoAdmision/AvisoAdmision';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import {
  JORNADAS, MINUTOS_FRANJA, bloquesDeSala, cabe, horaFranja, mapaOcupado, rangoLabel, reubicar,
} from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';
import { esAmbulatorio } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';
import {
  SALAS, addDias, fechaISO, fetchAgendaRango,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Sede fija '02' en todo el módulo (ver CanastasCirugia.jsx); se ofrecen los
// quirófanos (las salas de procedimientos tienen su propia agenda).
const SEDE_ID = '02';
const SALAS_MODAL = SALAS.filter((s) => s.sedeId === SEDE_ID && s.value.startsWith('qx-'));

// Modal "Programar cirugía" de Gestión de cirugías: agenda de salas del día
// (con las cirugías reales ya programadas), sala/hora de esta cirugía
// y sus tiempos postquirúrgico y de recuperación (personal y equipos se eligen
// después, en el wizard). No navega: al continuar avisa al
// padre (`onElegir`), que abre el wizard "Nueva cirugía" con todo esto
// precargado para completar los datos administrativos y los insumos.
export default function SeleccionarHuecoModal({
  solicitud, duracionMin, onClose, onElegir,
}) {
  const modalRef = useRef(null);
  useModalFocusTrap(modalRef);

  const [date, setDate] = useState(() => {
    // Arranca en la fecha tentativa de la solicitud.
    const [y, m, d] = solicitud.fechaTentativa.split('-').map(Number);
    return new Date(y, m - 1, d);
  });
  const fecha = fechaISO(date);
  const [datos, setDatos] = useState(null); // { fecha, salas }
  const [duracion, setDuracion] = useState(() => Math.max(1, Math.round(duracionMin / MINUTOS_FRANJA)));
  const [seleccion, setSeleccion] = useState(null);
  // Tiempos fuera de quirófano (min): se capturan aquí y viajan al wizard.
  const [durPost, setDurPost] = useState(30);
  const [durRecup, setDurRecup] = useState(60);
  const [aviso, setAviso] = useState(null);
  // Ventana visible de la agenda: día completo o jornada operativa. Es solo de
  // visualización: no cambia los datos ni las franjas.
  const [jornada, setJornada] = useState('24h');
  // La carga de la agenda es asíncrona; su `.then` necesita la duración vigente.
  const duracionRef = useRef(duracion);
  const jornadaRef = useRef(jornada);

  useEffect(() => {
    let cancelled = false;
    Promise.all(SALAS_MODAL.map((s) => fetchAgendaRango({
      sedeId: SEDE_ID, salaId: s.value, inicio: fecha, fin: fecha,
    }))).then((porSala) => {
      if (cancelled) return;
      const salas = SALAS_MODAL.map((s, i) => {
        const bloques = bloquesDeSala(porSala[i], s.estado === 'Mantenimiento');
        return {
          id: s.value, nombre: s.descripcion, bloques, mapa: mapaOcupado(bloques),
        };
      });
      setDatos({ fecha, salas });
      // Conserva la selección si sigue libre ese día; si no, la reubica.
      setSeleccion((prev) => reubicar(salas, prev, duracionRef.current, JORNADAS[jornadaRef.current]));
    });
    return () => { cancelled = true; };
  }, [fecha]);

  // Escape cierra (el foco queda atrapado en el modal por useModalFocusTrap).
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const salas = datos?.fecha === fecha ? datos.salas : null;
  const salaElegida = salas?.find((s) => s.id === seleccion?.salaId);

  function handleElegir(salaId, inicio) {
    const sala = salas?.find((s) => s.id === salaId);
    if (!sala || !cabe(sala.mapa, inicio, duracion)) {
      setAviso('La cirugía no cabe en esa franja: elige otra con más tiempo libre.');
      return;
    }
    setAviso(null);
    setSeleccion({ salaId, inicio });
  }

  function handleDuracion(nueva) {
    if (!salas) return;
    const nuevaSel = reubicar(salas, seleccion, nueva, JORNADAS[jornada]);
    if (!nuevaSel) {
      setAviso('No hay una franja libre para esa duración este día. Se mantiene la anterior.');
      return;
    }
    duracionRef.current = nueva;
    setDuracion(nueva);
    setSeleccion(nuevaSel);
    const movida = seleccion && (nuevaSel.salaId !== seleccion.salaId || nuevaSel.inicio !== seleccion.inicio);
    setAviso(movida
      ? `La nueva duración no cabía en la franja: se reubicó a ${rangoLabel(nuevaSel.inicio, nueva).slice(0, 5)} en ${salas.find((s) => s.id === nuevaSel.salaId).nombre}.`
      : null);
  }

  // Cambiar de jornada solo cambia lo que se ve; si la cirugía queda fuera de la
  // ventana, se acomoda dentro de ella (primera franja libre) y se avisa.
  function handleJornada(nueva) {
    jornadaRef.current = nueva;
    setJornada(nueva);
    setAviso(null);
    if (!salas) return;
    const ventana = JORNADAS[nueva];
    const nuevaSel = reubicar(salas, seleccion, duracion, ventana);
    if (nuevaSel && (nuevaSel.salaId !== seleccion?.salaId || nuevaSel.inicio !== seleccion?.inicio)) {
      setSeleccion(nuevaSel);
      setAviso(`La cirugía quedaba fuera de la ${JORNADAS[nueva].label.toLowerCase()}: se reubicó a ${rangoLabel(nuevaSel.inicio, duracion).slice(0, 5)}.`);
    }
  }

  function handleDia(delta) {
    setAviso(null);
    setDate((d) => addDias(d, delta));
  }

  const puedeContinuar = Boolean(seleccion);
  const bloqueo = seleccion ? null : 'Elige una franja libre en la agenda.';

  function handleContinuar() {
    if (!puedeContinuar || !salaElegida) return;
    onElegir({
      salaId: salaElegida.id,
      fecha,
      hora: horaFranja(seleccion.inicio),
      duracionMin: duracion * MINUTOS_FRANJA,
      duracionPostquirurgicaMin: durPost,
      duracionRecuperacionMin: durRecup,
    });
  }

  return (
    <div className="modal-overlay open">
      <div
        ref={modalRef}
        className="modal-card shm-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shm-title"
      >
        <ModalHeader
          title="Programar cirugía"
          titleId="shm-title"
          onClose={onClose}
          closeLabel="Cerrar programación"
        />
        <FranjaPaciente solicitud={solicitud} />

        <div className="shm-workspace">
          <AgendaSalas
            fecha={fecha}
            date={date}
            onDia={handleDia}
            salas={salas}
            seleccion={seleccion}
            duracion={duracion}
            onElegir={handleElegir}
            jornada={jornada}
            onJornada={handleJornada}
          />

          <section className="shm-datos" aria-label="Datos de la programación">
            <div className="shm-datos-cuerpo">
              <SeccionFechaSala
                fecha={fecha}
                sala={salaElegida}
                seleccion={seleccion}
                duracion={duracion}
                onDuracion={handleDuracion}
                post={durPost}
                onPost={setDurPost}
                recuperacion={durRecup}
                onRecuperacion={setDurRecup}
                aviso={aviso}
              />
              <AvisoAdmision ambulatorio={esAmbulatorio(solicitud)} />
            </div>
            <footer className="shm-footer">
              {bloqueo && <p className="shm-bloqueo" id="shm-bloqueo">{bloqueo}</p>}
              <p className="shm-siguiente">Siguiente: datos administrativos e insumos de la cirugía.</p>
              <div className="shm-botones">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button
                  icon={LuArrowRight}
                  className="shm-continuar"
                  disabled={!puedeContinuar}
                  aria-describedby={bloqueo ? 'shm-bloqueo' : undefined}
                  onClick={handleContinuar}
                >
                  Continuar
                </Button>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
}
