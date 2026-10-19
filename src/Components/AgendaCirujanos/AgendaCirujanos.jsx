'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Tokens (:root), shell (.app/.main/.content), toast, modales y barra de
// filtros de la jornada de cirugía: los mismos 2 archivos que cargan las demás
// rutas de /cirugia (ver RevisionVencidas.jsx).
import '../ProgramacionSalaCirugias/ProgramacionSalaCirugias.css';
import '../ProgramacionSalaCirugias/shared/shared.css';
import './AgendaCirujanos.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import ListadoCirujanos from './ListadoCirujanos/ListadoCirujanos';
import EditorAgenda from './EditorAgenda/EditorAgenda';
import { useSedeSeleccionada } from '@/hooks/Sede/sede';
import { hoyISO, listarCirujanos, USUARIO_ACTUAL } from '@/hooks/AgendaCirujanos/agendaCirujanosService';
import { puedeEditarAgenda } from '@/hooks/AgendaCirujanos/permisos';

const RUTA = '/cirugia/configuracion/agenda-cirujanos';
const hrefEditor = (idMedico) => `${RUTA}?cirujano=${encodeURIComponent(idMedico)}`;

// "Agenda de cirujanos" (spec 2026-10-14): configuración de la disponibilidad
// de cada cirujano. Una sola ruta: sin `?cirujano=` muestra el listado; con él,
// el editor de ese cirujano. El estado de cada vista vive en su componente; acá
// solo el shell, el listado cargado y el aviso (toast).
export default function AgendaCirujanos() {
  const router = useRouter();
  const idMedico = useSearchParams().get('cirujano');
  const sede = useSedeSeleccionada();
  const [hoy] = useState(() => hoyISO());
  const [filas, setFilas] = useState(null); // null = cargando
  const [aviso, setAviso] = useState(null);
  const avisoTimerRef = useRef(null);
  const salirEditorRef = useRef(null); // lo registra EditorAgenda (confirma si hay cambios sin guardar)

  useEffect(() => {
    const limpiarShell = initShellChrome({ startCollapsed: true });
    return () => limpiarShell?.();
  }, []);

  // Se recarga al volver del editor (idMedico pasa a null) para reflejar lo guardado.
  useEffect(() => {
    if (idMedico) return undefined;
    let cancelado = false;
    listarCirujanos({ sede: sede.descripcion }).then((items) => {
      if (!cancelado) setFilas(items);
    }).catch(() => {
      if (cancelado) return;
      setFilas([]);
      mostrarAviso('No se pudieron cargar los cirujanos. Inténtalo de nuevo.');
    });
    return () => { cancelado = true; };
  }, [idMedico, sede.descripcion]);

  useEffect(() => () => clearTimeout(avisoTimerRef.current), []);

  function mostrarAviso(mensaje) {
    setAviso(mensaje);
    clearTimeout(avisoTimerRef.current);
    avisoTimerRef.current = setTimeout(() => setAviso(null), 2600);
  }

  const irAlListado = () => router.push(RUTA);
  const puedeEditar = idMedico ? puedeEditarAgenda(USUARIO_ACTUAL, idMedico) : false;

  let cuerpo;
  if (!idMedico) {
    cuerpo = (
      <ListadoCirujanos
        filas={filas}
        hoy={hoy}
        usuario={USUARIO_ACTUAL}
        onAbrir={(id) => router.push(hrefEditor(id))}
      />
    );
  } else if (!puedeEditar) {
    cuerpo = (
      <div className="ac-card ac-estado" role="alert">
        <p className="ac-estado-titulo">No tienes permiso para editar esta agenda</p>
        <p>Solo Programación de cirugía o el propio cirujano pueden configurarla.</p>
        <Button variant="outline" onClick={irAlListado}>Volver al listado</Button>
      </div>
    );
  } else {
    cuerpo = (
      <EditorAgenda
        key={idMedico}
        idMedico={idMedico}
        hoy={hoy}
        onVolver={irAlListado}
        onAviso={mostrarAviso}
        salirRef={salirEditorRef}
      />
    );
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={idMedico
            ? ['Configuración', { label: 'Agenda de cirujanos', href: RUTA, onClick: () => (salirEditorRef.current ?? irAlListado)() }]
            : ['Configuración']}
          page={idMedico ? 'Programación de agenda' : 'Agenda de cirujanos'}
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">{cuerpo}</div>
      </div>

      <div className={`psc-toast${aviso ? ' show' : ''}`} role="status">
        <span className="psc-toast-dot" />
        <span>{aviso}</span>
      </div>
    </div>
  );
}
