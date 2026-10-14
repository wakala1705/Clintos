'use client';

import { useEffect, useRef, useState } from 'react';
import { LuChevronLeft } from 'react-icons/lu';
import './EditorAgenda.css';
import Button from '@/Components/Button/Button';
import PanelConfiguracion from '../PanelConfiguracion/PanelConfiguracion';
import HorarioSemanal from '../HorarioSemanal/HorarioSemanal';
import Excepciones from '../Excepciones/Excepciones';
import VistaPreviaSemanal from '../VistaPreviaSemanal/VistaPreviaSemanal';
import ExcepcionModal from '../modals/ExcepcionModal/ExcepcionModal';
import ImpactoModal from '../modals/ImpactoModal/ImpactoModal';
import SalirSinGuardarDialog from '../modals/SalirSinGuardarDialog/SalirSinGuardarDialog';
import useAgendaEditor from '@/hooks/AgendaCirujanos/useAgendaEditor';
import { excepcionNueva } from '@/hooks/AgendaCirujanos/excepciones';
import { cantidadCirugias } from '@/hooks/AgendaCirujanos/formato';
import { capitalizarNombre } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';

const AVISO_FALLO = 'No se pudo guardar el cambio. Inténtalo de nuevo.';
const AVISO_SOLO_ADVIERTE = 'Las cirugías ya programadas no se cancelan ni se reprograman automáticamente. Programación de cirugía deberá gestionarlas.';

// Editor de la agenda de UN cirujano: panel de configuración (horario semanal /
// excepciones) + vista previa. Todo el estado de datos vive en useAgendaEditor;
// acá solo la pestaña activa y el modal abierto. Los cambios que dejarían
// cirugías fuera de agenda solo ADVIERTEN (ImpactoModal): nada se cancela ni
// se reprograma. `modal` es null o uno de:
//   { tipo: 'excepcion', inicial }
//   { tipo: 'impacto', titulo, intro, items, textoVolver, textoConfirmar?, onVolver?, onConfirmar? }
//   { tipo: 'salir' }
export default function EditorAgenda({
  idMedico, hoy, onVolver, onAviso,
}) {
  const editor = useAgendaEditor(idMedico, hoy);
  const [pestana, setPestana] = useState('horario');
  const [modal, setModal] = useState(null);
  const tituloRef = useRef(null);
  // Llamada al servicio en vuelo (guardar horario / agregar / eliminar excepción).
  // El ref corta la reentrada dentro del mismo tick (dos clics antes de re-renderizar);
  // el estado deshabilita los controles mientras dura.
  const [ocupado, setOcupado] = useState(false);
  const ocupadoRef = useRef(false);

  // Con horario sin guardar, cerrar o recargar la pestaña pide confirmación.
  useEffect(() => {
    if (!editor.sinGuardar) return undefined;
    const avisar = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [editor.sinGuardar]);

  // Al terminar de cargar, el foco va al título (como al entrar a una pantalla nueva).
  useEffect(() => {
    if (!editor.cargando) tituloRef.current?.focus();
  }, [editor.cargando]);

  if (editor.cargando) return <p className="ac-estado" role="status">Cargando agenda…</p>;
  if (!editor.cirujano) {
    return (
      <div className="ac-card ac-estado" role="alert">
        <p className="ac-estado-titulo">
          {editor.errorCarga ? 'No se pudo cargar la agenda' : 'No se encontró el cirujano'}
        </p>
        <Button variant="outline" onClick={onVolver}>Volver al listado</Button>
      </div>
    );
  }

  const nombre = capitalizarNombre(editor.cirujano.nombre);
  const cerrarModal = () => setModal(null);

  // Ejecuta `operacion` (que devuelve una promesa) ignorando llamadas repetidas
  // mientras hay una en vuelo; libera `ocupado` tanto en éxito como en fallo.
  function ejecutarOcupado(operacion) {
    if (ocupadoRef.current) return;
    ocupadoRef.current = true;
    setOcupado(true);
    operacion().finally(() => {
      ocupadoRef.current = false;
      setOcupado(false);
    });
  }

  function handleVolver() {
    if (ocupadoRef.current) return;
    if (editor.sinGuardar) setModal({ tipo: 'salir' });
    else onVolver();
  }

  function abrirImpacto(items, opciones) {
    setModal({
      tipo: 'impacto',
      items,
      intro: AVISO_SOLO_ADVIERTE,
      textoVolver: 'Volver a editar',
      ...opciones,
    });
  }

  function confirmarGuardado() {
    ejecutarOcupado(() => editor.guardar().then((ok) => {
      if (!ok) { onAviso(AVISO_FALLO); return; }
      cerrarModal();
      onAviso('Horario guardado');
    }).catch(() => onAviso(AVISO_FALLO)));
  }

  function handleGuardar() {
    const nuevos = editor.conflictosAlGuardar();
    if (nuevos.length === 0) {
      confirmarGuardado();
      return;
    }
    abrirImpacto(nuevos, {
      titulo: `Este horario deja ${cantidadCirugias(nuevos.length)} fuera de agenda`,
      textoConfirmar: 'Guardar de todos modos',
      onConfirmar: confirmarGuardado,
    });
  }

  function handleGuardarExcepcion(datos) {
    const aplicar = () => ejecutarOcupado(() => editor.anadirExcepcion(datos).then((ok) => {
      if (!ok) { onAviso(AVISO_FALLO); return; }
      cerrarModal();
      onAviso(datos.tipo === 'bloqueo' ? 'Bloqueo agregado' : 'Apertura agregada');
    }).catch(() => onAviso(AVISO_FALLO)));
    const nuevos = editor.conflictosAlAgregar(datos);
    if (nuevos.length === 0) {
      aplicar();
      return;
    }
    abrirImpacto(nuevos, {
      titulo: `Esto deja ${cantidadCirugias(nuevos.length)} fuera de agenda`,
      textoConfirmar: 'Guardar de todos modos',
      // Volver a editar reabre el formulario con lo que el usuario ya había escrito.
      onVolver: () => setModal({ tipo: 'excepcion', inicial: datos }),
      onConfirmar: aplicar,
    });
  }

  function handleEliminarExcepcion(idExcepcion) {
    const aplicar = () => ejecutarOcupado(() => editor.quitarExcepcion(idExcepcion).then((ok) => {
      if (!ok) { onAviso(AVISO_FALLO); return; }
      cerrarModal();
      onAviso('Excepción eliminada');
    }).catch(() => onAviso(AVISO_FALLO)));
    const nuevos = editor.conflictosAlEliminar(idExcepcion);
    if (nuevos.length === 0) {
      aplicar();
      return;
    }
    abrirImpacto(nuevos, {
      titulo: `Esto deja ${cantidadCirugias(nuevos.length)} fuera de agenda`,
      textoVolver: 'Cancelar',
      textoConfirmar: 'Eliminar de todos modos',
      onConfirmar: aplicar,
    });
  }

  function handleVerConflictos() {
    if (editor.conflictos.length === 0) return;
    abrirImpacto(editor.conflictos, {
      titulo: `${cantidadCirugias(editor.conflictos.length)} fuera de agenda`,
      intro: `Estas cirugías ya programadas quedan fuera de la disponibilidad actual. ${AVISO_SOLO_ADVIERTE}`,
      textoVolver: 'Cerrar',
    });
  }

  return (
    <div className="ac-editor">
      <div className="psc-page-header">
        <div>
          <button type="button" className="ac-volver" disabled={ocupado} onClick={handleVolver}>
            <LuChevronLeft className="icon" aria-hidden="true" />
            Agenda de cirujanos
          </button>
          <h1 ref={tituloRef} tabIndex={-1}>Agenda de {nombre}</h1>
          <p>Define cuándo está disponible para que Programación le asigne cirugías.</p>
        </div>
        <div className="psc-page-header-actions">
          {editor.sinGuardar && (
            <span className={`ac-pendiente${editor.hayErrores ? ' error' : ''}`} role="status">
              {editor.hayErrores ? 'Hay errores por corregir' : 'Horario sin guardar'}
            </span>
          )}
          <Button variant="outline" disabled={!editor.sinGuardar || ocupado} onClick={editor.descartar}>
            Descartar cambios
          </Button>
          <Button
            disabled={!editor.sinGuardar || editor.hayErrores || ocupado}
            title={editor.hayErrores ? 'Corrige los errores marcados para guardar' : undefined}
            onClick={handleGuardar}
          >
            Guardar horario
          </Button>
        </div>
      </div>

      <div className="ac-layout">
        <PanelConfiguracion
          pestana={pestana}
          onPestana={setPestana}
          cantidadExcepciones={editor.excepciones.length}
        >
          {pestana === 'horario' ? (
            <HorarioSemanal
              horario={editor.borrador}
              onChange={editor.setBorrador}
              sinAgenda={!editor.tieneAgenda}
              sede={editor.cirujano.sede}
              onAviso={onAviso}
            />
          ) : (
            <Excepciones
              excepciones={editor.excepciones}
              hoy={hoy}
              onAgregar={() => setModal({ tipo: 'excepcion', inicial: excepcionNueva(hoy) })}
              onEliminar={handleEliminarExcepcion}
            />
          )}
        </PanelConfiguracion>

        <VistaPreviaSemanal
          horario={editor.borrador}
          excepciones={editor.excepciones}
          cirugias={editor.cirugias}
          conflictos={editor.conflictos}
          hoy={hoy}
          onVerConflictos={handleVerConflictos}
        />
      </div>

      {modal?.tipo === 'excepcion' && (
        <ExcepcionModal inicial={modal.inicial} onGuardar={handleGuardarExcepcion} onCerrar={cerrarModal} ocupado={ocupado} />
      )}
      {modal?.tipo === 'impacto' && (
        <ImpactoModal
          titulo={modal.titulo}
          intro={modal.intro}
          items={modal.items}
          textoVolver={modal.textoVolver}
          textoConfirmar={modal.textoConfirmar}
          onVolver={modal.onVolver ?? cerrarModal}
          onConfirmar={modal.onConfirmar}
          ocupado={ocupado}
        />
      )}
      {modal?.tipo === 'salir' && (
        <SalirSinGuardarDialog onSeguir={cerrarModal} onSalir={onVolver} />
      )}
    </div>
  );
}
