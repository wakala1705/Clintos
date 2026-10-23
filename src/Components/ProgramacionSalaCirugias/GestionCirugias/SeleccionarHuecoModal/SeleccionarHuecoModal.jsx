'use client';

import { useEffect, useRef, useState } from 'react';
import './SeleccionarHuecoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FranjaPaciente from '../FranjaPaciente/FranjaPaciente';
import AgendaSalas from '../AgendaSalas/AgendaSalas';
import TiemposCirugia from '../TiemposCirugia/TiemposCirugia';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import {
  JORNADAS, MINUTOS_FRANJA, bloquesDeSala, cabe, desplazarHabiles, fechasDeVista, horaFranja, mapaOcupado, parseISO,
  primerHabil, rangoFechasLabel, rangoLabel, reubicar,
} from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';
import {
  SALAS, addDias, cirujanosDeSede, diaCortoLabel, fechaISO, fetchAgendaRango, rangoSemanaLabel,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Sede fija '02' en todo el módulo (ver CanastasCirugia.jsx); se ofrecen los
// quirófanos (las salas de procedimientos tienen su propia agenda).
const SEDE_ID = '02';
const SALAS_MODAL = SALAS.filter((s) => s.sedeId === SEDE_ID && s.value.startsWith('qx-'));

// Modal "Programar cirugía" de Gestión de cirugías: agenda semanal de una sala
// (una columna por día, con las cirugías reales ya programadas), día/hora de esta cirugía
// y su duración estimada (personal y equipos se eligen después, en el wizard;
// los tiempos postquirúrgico y de recuperación ya no se capturan). Con `cirujano` (filtro de la agenda) la grilla suma, como ocupado, lo que ese
// cirujano ya tiene en otras salas: una franja solo está libre si la sala y el cirujano lo están. No navega: al continuar avisa al
// padre (`onElegir`), que abre el wizard "Nueva cirugía" con todo esto
// precargado para completar los datos administrativos y los insumos.
export default function SeleccionarHuecoModal({
  solicitud, duracionMin, onClose, onElegir, cirujano: cirujanoInicial,
}) {
  const modalRef = useRef(null);
  useModalFocusTrap(modalRef);

  const [salaId, setSalaId] = useState(SALAS_MODAL[0].value);
  // Filtro por cirujano (parte del de la agenda; se puede cambiar o quitar aquí). '' = sin filtro.
  const [cirujano, setCirujano] = useState(cirujanoInicial ?? '');
  const [date, setDate] = useState(() => parseISO(solicitud.fechaTentativa)); // arranca en la fecha tentativa
  // Días visibles: 'habil' (lunes a viernes, por defecto), 'semana' (lunes a
  // domingo) o 'tres' (3 días hábiles desde hoy).
  const [vistaDias, setVistaDias] = useState('habil');
  const esTres = vistaDias === 'tres';
  const anchorIso = fechaISO(date);
  const fechasVista = fechasDeVista(esTres, anchorIso);
  const claveCarga = `${fechasVista[0]}|${fechasVista.length}|${salaId}|${cirujano}`;
  const [datos, setDatos] = useState(null); // { clave, dias }
  const [duracion, setDuracion] = useState(() => Math.max(1, Math.round(duracionMin / MINUTOS_FRANJA)));
  const [seleccion, setSeleccion] = useState(null);
  // Fecha de hoy, tomada una sola vez, para marcarla en la agenda.
  const [hoy] = useState(() => fechaISO(new Date()));
  const [aviso, setAviso] = useState(null);
  // Horas visibles (jornada operativa por defecto o 24 h). Es solo de
  // visualización: no cambia los datos ni las franjas.
  const [jornada, setJornada] = useState('operativa');
  // La carga de la agenda es asíncrona; su `.then` necesita lo vigente.
  const duracionRef = useRef(duracion);
  const jornadaRef = useRef(jornada);
  const vistaDiasRef = useRef(vistaDias);
  const seleccionRef = useRef(seleccion);
  const avisarRef = useRef(false); // avisar si el cambio de vista mueve la selección
  useEffect(() => { seleccionRef.current = seleccion; }, [seleccion]);

  useEffect(() => {
    let cancelled = false;
    const fechas = fechasDeVista(esTres, anchorIso);
    const sala = SALAS_MODAL.find((x) => x.value === salaId);
    const rango = { sedeId: SEDE_ID, inicio: fechas[0], fin: fechas[fechas.length - 1] };
    Promise.all([
      fetchAgendaRango({ ...rango, salaId }),
      cirujano ? fetchAgendaRango({ ...rango, salaId: 'todas', cirujano }) : Promise.resolve([]),
    ]).then(([cirugias, delCirujano]) => {
      if (cancelled) return;
      const enOtrasSalas = delCirujano.filter((c) => c.salaId !== salaId);
      const dias = fechas.map((fechaDia) => {
        const mantenimiento = sala.estado === 'Mantenimiento';
        const propios = bloquesDeSala(cirugias.filter((c) => c.fecha === fechaDia), mantenimiento);
        // Lo del cirujano en otras salas: un bloque por cirugía, rotulado con su sala.
        const ajenos = mantenimiento ? [] : enOtrasSalas.filter((c) => c.fecha === fechaDia).flatMap((c) => (
          bloquesDeSala([c]).map((bl) => ({ ...bl, cirujano: SALAS.find((x) => x.value === c.salaId)?.descripcion ?? '' }))
        ));
        const bloques = [...propios, ...ajenos];
        return {
          id: fechaDia, bloques, mapa: mapaOcupado(bloques),
        };
      });
      setDatos({ clave: claveCarga, dias });
      // Conserva la selección si sigue libre; la primera vez prefiere la fecha
      // tentativa. Si no, la reubica en la primera franja libre de lo visible.
      const visibles = vistaDiasRef.current === 'habil' ? dias.slice(0, 5) : dias;
      const prev = seleccionRef.current;
      const sugerida = prev ?? (visibles.some((d) => d.id === solicitud.fechaTentativa) ? { colId: solicitud.fechaTentativa, inicio: -1 } : null);
      const nueva = reubicar(visibles, sugerida, duracionRef.current, JORNADAS[jornadaRef.current]);
      setSeleccion(nueva);
      if (avisarRef.current) {
        avisarRef.current = false;
        if (prev && nueva && (nueva.colId !== prev.colId || nueva.inicio !== prev.inicio)) {
          setAviso(`La cirugía quedaba fuera de los días visibles: se reubicó al ${diaCortoLabel(nueva.colId)} a las ${rangoLabel(nueva.inicio, duracionRef.current).slice(0, 5)}.`);
        }
      }
    });
    return () => { cancelled = true; };
  }, [claveCarga, esTres, anchorIso, salaId, cirujano, solicitud.fechaTentativa]);

  // Escape cierra (el foco queda atrapado en el modal por useModalFocusTrap).
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const diasSemana = datos?.clave === claveCarga ? datos.dias : null;
  const dias = vistaDias === 'habil' ? diasSemana?.slice(0, 5) ?? null : diasSemana;
  const etiquetaRango = esTres
    ? rangoFechasLabel(fechasVista[0], fechasVista[2])
    : rangoSemanaLabel(parseISO(fechasVista[0]));
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

  // Cambiar los días visibles. Entre semana completa y hábil solo se oculta o
  // muestra el fin de semana; con "3 días" (que parte de hoy) cambia el rango
  // cargado y la selección, si queda fuera, se reubica al llegar los datos.
  function handleDiasVista(nueva) {
    if (nueva === vistaDias) return;
    vistaDiasRef.current = nueva;
    setVistaDias(nueva);
    setAviso(null);
    if (nueva === 'tres') {
      avisarRef.current = true;
      setDate(parseISO(primerHabil(hoy)));
      return;
    }
    if (esTres) {
      avisarRef.current = true;
      return;
    }
    if (!diasSemana) return;
    const visibles = nueva === 'habil' ? diasSemana.slice(0, 5) : diasSemana;
    const nuevaSel = reubicar(visibles, seleccion, duracion, JORNADAS[jornada]);
    if (nuevaSel && (nuevaSel.colId !== seleccion?.colId || nuevaSel.inicio !== seleccion?.inicio)) {
      setSeleccion(nuevaSel);
      setAviso(`La cirugía quedaba en fin de semana: se reubicó al ${diaCortoLabel(nuevaSel.colId)} a las ${rangoLabel(nuevaSel.inicio, duracion).slice(0, 5)}.`);
    }
  }

  // Semana siguiente/anterior; con "3 días", los 3 días hábiles siguientes/anteriores.
  function handleSemana(delta) {
    setAviso(null);
    if (esTres) setDate(parseISO(desplazarHabiles(fechasVista[0], 3 * delta)));
    else setDate((d) => addDias(d, 7 * delta));
  }

  function handleSala(nueva) {
    setAviso(null);
    setSalaId(nueva);
  }
  function handleCirujano(nuevo) {
    setAviso(null);
    setCirujano(nuevo);
  }

  const puedeContinuar = Boolean(seleccion);

  function handleContinuar() {
    if (!puedeContinuar) return;
    onElegir({
      salaId: salaElegida.value,
      cirujano: cirujano || undefined,
      fecha: seleccion.colId,
      hora: horaFranja(seleccion.inicio),
      duracionMin: duracion * MINUTOS_FRANJA,
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
        <div className="shm-workspace">
          <aside className="shm-lateral" aria-label="Paciente y tiempos de la cirugía">
            <FranjaPaciente solicitud={solicitud} />
            <TiemposCirugia
              duracion={duracion}
              onDuracion={handleDuracion}
              aviso={aviso}
            />
          </aside>

          <AgendaSalas
            etiqueta={etiquetaRango}
            onSemana={handleSemana}
            salas={SALAS_MODAL}
            salaId={salaId}
            onSala={handleSala}
            cirujano={cirujano}
            cirujanos={cirujanosDeSede(SEDE_ID)}
            onCirujano={handleCirujano}
            dias={dias}
            diasVista={vistaDias}
            onDiasVista={handleDiasVista}
            hoy={hoy}
            postFranjas={0}
            recupFranjas={0}
            seleccion={seleccion}
            duracion={duracion}
            onElegir={handleElegir}
            jornada={jornada}
            onJornada={handleJornada}
          />
        </div>

        <footer className="shm-pie">
          <div className="shm-botones">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button
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
