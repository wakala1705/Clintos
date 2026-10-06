'use client';

import { useEffect, useRef, useState } from 'react';
import { LuArrowRight } from 'react-icons/lu';
import './SeleccionarHuecoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FranjaPaciente from '../FranjaPaciente/FranjaPaciente';
import AgendaSalas from '../AgendaSalas/AgendaSalas';
import TiemposCirugia from '../TiemposCirugia/TiemposCirugia';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import {
  JORNADAS, MINUTOS_FRANJA, bloquesDeSala, cabe, horaFranja, mapaOcupado, rangoLabel, reubicar,
} from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';
import {
  SALAS, addDias, diaCortoLabel, fechaISO, fetchAgendaRango, lunesDeSemana,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Sede fija '02' en todo el módulo (ver CanastasCirugia.jsx); se ofrecen los
// quirófanos (las salas de procedimientos tienen su propia agenda).
const SEDE_ID = '02';
const SALAS_MODAL = SALAS.filter((s) => s.sedeId === SEDE_ID && s.value.startsWith('qx-'));

// Modal "Programar cirugía" de Gestión de cirugías: agenda semanal de una sala
// (una columna por día, con las cirugías reales ya programadas), día/hora de esta cirugía
// y sus tiempos postquirúrgico y de recuperación (personal y equipos se eligen
// después, en el wizard). No navega: al continuar avisa al
// padre (`onElegir`), que abre el wizard "Nueva cirugía" con todo esto
// precargado para completar los datos administrativos y los insumos.
export default function SeleccionarHuecoModal({
  solicitud, duracionMin, onClose, onElegir,
}) {
  const modalRef = useRef(null);
  useModalFocusTrap(modalRef);

  const [salaId, setSalaId] = useState(SALAS_MODAL[0].value);
  const [date, setDate] = useState(() => {
    // Arranca en la fecha tentativa de la solicitud.
    const [y, m, d] = solicitud.fechaTentativa.split('-').map(Number);
    return new Date(y, m - 1, d);
  });
  // La agenda muestra la semana (lunes a domingo) que contiene `date`.
  const lunes = lunesDeSemana(date);
  const semana = fechaISO(lunes);
  const claveCarga = `${semana}|${salaId}`;
  const [datos, setDatos] = useState(null); // { clave, dias }
  const [duracion, setDuracion] = useState(() => Math.max(1, Math.round(duracionMin / MINUTOS_FRANJA)));
  const [seleccion, setSeleccion] = useState(null);
  // Fecha de hoy, tomada una sola vez, para marcarla en la agenda.
  const [hoy] = useState(() => fechaISO(new Date()));
  // Tiempos fuera de quirófano (min): se capturan aquí y viajan al wizard.
  const [durPost, setDurPost] = useState(30);
  const [durRecup, setDurRecup] = useState(60);
  const [aviso, setAviso] = useState(null);
  // Vista de la agenda (por defecto jornada operativa y semana hábil): horas
  // visibles (día completo o jornada operativa). Es solo de
  // visualización: no cambia los datos ni las franjas.
  const [jornada, setJornada] = useState('operativa');
  // Semana hábil: oculta sábado y domingo (las 5 primeras columnas del lunes).
  const [soloHabiles, setSoloHabiles] = useState(true);
  // La carga de la agenda es asíncrona; su `.then` necesita la duración vigente.
  const duracionRef = useRef(duracion);
  const jornadaRef = useRef(jornada);
  const habilesRef = useRef(soloHabiles);

  useEffect(() => {
    let cancelled = false;
    const sala = SALAS_MODAL.find((x) => x.value === salaId);
    const inicio = new Date(`${semana}T00:00:00`);
    fetchAgendaRango({
      sedeId: SEDE_ID, salaId, inicio: semana, fin: fechaISO(addDias(inicio, 6)),
    }).then((cirugias) => {
      if (cancelled) return;
      const dias = Array.from({ length: 7 }, (_, k) => {
        const fechaDia = fechaISO(addDias(inicio, k));
        const bloques = bloquesDeSala(cirugias.filter((c) => c.fecha === fechaDia), sala.estado === 'Mantenimiento');
        return {
          id: fechaDia, bloques, mapa: mapaOcupado(bloques),
        };
      });
      setDatos({ clave: claveCarga, dias });
      // Conserva la selección si sigue libre; la primera vez prefiere la fecha
      // tentativa. Si no, la reubica en la primera franja libre de la semana.
      setSeleccion((prev) => reubicar(
        habilesRef.current ? dias.slice(0, 5) : dias,
        prev ?? ((habilesRef.current ? dias.slice(0, 5) : dias).some((d) => d.id === solicitud.fechaTentativa) ? { colId: solicitud.fechaTentativa, inicio: -1 } : null),
        duracionRef.current,
        JORNADAS[jornadaRef.current],
      ));
    });
    return () => { cancelled = true; };
  }, [claveCarga, semana, salaId, solicitud.fechaTentativa]);

  // Escape cierra (el foco queda atrapado en el modal por useModalFocusTrap).
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const diasSemana = datos?.clave === claveCarga ? datos.dias : null;
  const dias = soloHabiles ? diasSemana?.slice(0, 5) ?? null : diasSemana;
  const salaElegida = SALAS_MODAL.find((x) => x.value === salaId);

  function handleElegir(colId, inicio) {
    const dia = dias?.find((d) => d.id === colId);
    if (!dia || !cabe(dia.mapa, inicio, duracion)) {
      setAviso('La cirugía no cabe en esa franja: elige otra con más tiempo libre.');
      return;
    }
    setAviso(null);
    setSeleccion({ colId, inicio });
  }

  function handleDuracion(nueva) {
    if (!dias) return;
    const nuevaSel = reubicar(dias, seleccion, nueva, JORNADAS[jornada]);
    if (!nuevaSel) {
      setAviso('No hay una franja libre para esa duración este día. Se mantiene la anterior.');
      return;
    }
    duracionRef.current = nueva;
    setDuracion(nueva);
    setSeleccion(nuevaSel);
    const movida = seleccion && (nuevaSel.colId !== seleccion.colId || nuevaSel.inicio !== seleccion.inicio);
    setAviso(movida
      ? `La nueva duración no cabía en la franja: se reubicó a ${rangoLabel(nuevaSel.inicio, nueva).slice(0, 5)} el ${diaCortoLabel(nuevaSel.colId)}.`
      : null);
  }

  // Cambiar de jornada solo cambia lo que se ve; si la cirugía queda fuera de la
  // ventana, se acomoda dentro de ella (primera franja libre) y se avisa.
  function handleJornada(nueva) {
    jornadaRef.current = nueva;
    setJornada(nueva);
    setAviso(null);
    if (!dias) return;
    const ventana = JORNADAS[nueva];
    const nuevaSel = reubicar(dias, seleccion, duracion, ventana);
    if (nuevaSel && (nuevaSel.colId !== seleccion?.colId || nuevaSel.inicio !== seleccion?.inicio)) {
      setSeleccion(nuevaSel);
      setAviso(`La cirugía quedaba fuera de la ${JORNADAS[nueva].label.toLowerCase()}: se reubicó a ${rangoLabel(nuevaSel.inicio, duracion).slice(0, 5)}.`);
    }
  }

  // Al ocultar el fin de semana, una selección en sábado o domingo se acomoda
  // en la primera franja libre de lunes a viernes.
  function handleSoloHabiles(nuevo) {
    habilesRef.current = nuevo;
    setSoloHabiles(nuevo);
    setAviso(null);
    if (!diasSemana) return;
    const visibles = nuevo ? diasSemana.slice(0, 5) : diasSemana;
    const nuevaSel = reubicar(visibles, seleccion, duracion, JORNADAS[jornada]);
    if (nuevaSel && (nuevaSel.colId !== seleccion?.colId || nuevaSel.inicio !== seleccion?.inicio)) {
      setSeleccion(nuevaSel);
      setAviso(`La cirugía quedaba en fin de semana: se reubicó al ${diaCortoLabel(nuevaSel.colId)} a las ${rangoLabel(nuevaSel.inicio, duracion).slice(0, 5)}.`);
    }
  }

  function handleSemana(delta) {
    setAviso(null);
    setDate((d) => addDias(d, 7 * delta));
  }

  function handleSala(nueva) {
    setAviso(null);
    setSalaId(nueva);
  }

  const puedeContinuar = Boolean(seleccion);

  function handleContinuar() {
    if (!puedeContinuar) return;
    onElegir({
      salaId: salaElegida.value,
      fecha: seleccion.colId,
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
            lunes={lunes}
            onSemana={handleSemana}
            salas={SALAS_MODAL}
            salaId={salaId}
            onSala={handleSala}
            dias={dias}
            soloHabiles={soloHabiles}
            onSoloHabiles={handleSoloHabiles}
            hoy={hoy}
            postFranjas={durPost / MINUTOS_FRANJA}
            recupFranjas={durRecup / MINUTOS_FRANJA}
            seleccion={seleccion}
            duracion={duracion}
            onElegir={handleElegir}
            jornada={jornada}
            onJornada={handleJornada}
          >
            <TiemposCirugia
              duracion={duracion}
              onDuracion={handleDuracion}
              post={durPost}
              onPost={setDurPost}
              recuperacion={durRecup}
              onRecuperacion={setDurRecup}
              aviso={aviso}
            />
          </AgendaSalas>

        </div>

        <footer className="shm-pie">
          <div className="shm-botones">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button
              icon={LuArrowRight}
              className="shm-continuar"
              disabled={!puedeContinuar}
              onClick={handleContinuar}
            >
              Continuar
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
