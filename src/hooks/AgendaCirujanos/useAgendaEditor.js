'use client';

import { useEffect, useState } from 'react';
import {
  agregarExcepcion, eliminarExcepcion, guardarHorario, listarCirugiasDeCirujano, obtenerAgenda,
  obtenerCirujano,
} from './agendaCirujanosService';
import { cirugiasEnConflicto, conflictosNuevos } from './conflictos';
import { horarioVacio, horariosIguales } from './horario';
import { horarioTieneErrores } from './validaciones';

// Estado del editor de la agenda de UN cirujano: horario guardado vs borrador,
// excepciones, cirugías del cirujano y los conflictos que cada cambio causaría.
// Es lógica sin JSX; la regla de qué es un conflicto vive en conflictos.js.
//
// El horario semanal se edita como borrador y se guarda con `guardar()`; las
// excepciones se guardan al instante (`anadirExcepcion` / `quitarExcepcion`).
// Los `conflictosAl...` calculan, SIN cambiar nada, lo que empeoraría: la UI los
// muestra en un modal antes de confirmar. Nunca se cancela ni se reprograma
// ninguna cirugía.
//
// Los handlers y los efectos tratan el estado como posiblemente nulo (React
// Compiler: un deps nulo revienta el render, ver memoria del proyecto).
/**
 * @param {string} idMedico
 * @param {string} hoy 'YYYY-MM-DD'
 */
export default function useAgendaEditor(idMedico, hoy) {
  const [cargando, setCargando] = useState(true);
  const [cirujano, setCirujano] = useState(/** @type {import('./tipos.js').Cirujano|null} */ (null));
  const [tieneAgenda, setTieneAgenda] = useState(false);
  const [guardado, setGuardado] = useState(() => horarioVacio(hoy));
  const [borrador, setBorrador] = useState(() => horarioVacio(hoy));
  const [excepciones, setExcepciones] = useState(/** @type {import('./tipos.js').Excepcion[]} */ ([]));
  const [errorCarga, setErrorCarga] = useState(false);
  const [cirugias, setCirugias] = useState(/** @type {import('./tipos.js').CirugiaAgenda[]} */ ([]));

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      obtenerCirujano(idMedico),
      obtenerAgenda(idMedico),
      listarCirugiasDeCirujano(idMedico),
    ]).then(([datosCirujano, agenda, susCirugias]) => {
      if (cancelado) return;
      const inicial = agenda?.horario ?? horarioVacio(hoy);
      setCirujano(datosCirujano);
      setTieneAgenda(!!agenda?.horario);
      setGuardado(inicial);
      setBorrador(inicial);
      setExcepciones(agenda?.excepciones ?? []);
      setCirugias(susCirugias ?? []);
      setCargando(false);
    }).catch(() => {
      if (cancelado) return;
      setCirujano(null);
      setErrorCarga(true);
      setCargando(false);
    });
    return () => { cancelado = true; };
  }, [idMedico, hoy]);

  const sinGuardar = !horariosIguales(borrador, guardado);
  const hayErrores = horarioTieneErrores(borrador);
  const conflictos = cirugiasEnConflicto(cirugias, { horario: borrador, excepciones }, hoy);

  /** Conflictos nuevos que causaría guardar el borrador. */
  function conflictosAlGuardar() {
    return conflictosNuevos(
      cirugias,
      { horario: guardado, excepciones },
      { horario: borrador, excepciones },
      hoy,
    );
  }

  /** @param {import('./tipos.js').Excepcion[]} nuevas */
  function conflictosConExcepciones(nuevas) {
    return conflictosNuevos(
      cirugias,
      { horario: borrador, excepciones },
      { horario: borrador, excepciones: nuevas },
      hoy,
    );
  }

  /** @param {import('./tipos.js').BorradorExcepcion} datos */
  function conflictosAlAgregar(datos) {
    return conflictosConExcepciones([...excepciones, { ...datos, id: -1 }]);
  }

  /** @param {number} idExcepcion */
  function conflictosAlEliminar(idExcepcion) {
    return conflictosConExcepciones(excepciones.filter((x) => x.id !== idExcepcion));
  }

  function descartar() {
    setBorrador(guardado);
  }

  async function guardar() {
    const agenda = await guardarHorario(idMedico, borrador);
    if (!agenda?.horario) return false;
    setGuardado(agenda.horario);
    setBorrador(agenda.horario);
    setTieneAgenda(true);
    return true;
  }

  /** @param {import('./tipos.js').BorradorExcepcion} datos */
  async function anadirExcepcion(datos) {
    const agenda = await agregarExcepcion(idMedico, datos);
    if (!agenda?.excepciones) return false;
    setExcepciones(agenda.excepciones);
    return true;
  }

  /** @param {number} idExcepcion */
  async function quitarExcepcion(idExcepcion) {
    const agenda = await eliminarExcepcion(idMedico, idExcepcion);
    if (!agenda?.excepciones) return false;
    setExcepciones(agenda.excepciones);
    return true;
  }

  return {
    cargando,
    errorCarga,
    cirujano,
    tieneAgenda,
    borrador,
    setBorrador,
    excepciones,
    cirugias,
    conflictos,
    sinGuardar,
    hayErrores,
    conflictosAlGuardar,
    conflictosAlAgregar,
    conflictosAlEliminar,
    descartar,
    guardar,
    anadirExcepcion,
    quitarExcepcion,
  };
}
