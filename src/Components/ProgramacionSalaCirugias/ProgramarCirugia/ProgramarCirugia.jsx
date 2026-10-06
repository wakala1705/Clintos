'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LuChevronRight, LuPackageCheck } from 'react-icons/lu';
import '../ProgramacionSalaCirugias.css';
import '../shared/shared.css';
import './ProgramarCirugia.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import FranjaPaciente from './FranjaPaciente/FranjaPaciente';
import AgendaSalas from './AgendaSalas/AgendaSalas';
import SeccionFechaSala from './SeccionFechaSala/SeccionFechaSala';
import SeccionPersonal, { estadoPersonal } from './SeccionPersonal/SeccionPersonal';
import SeccionEquipos from './SeccionEquipos/SeccionEquipos';
import SeccionCanasta from './SeccionCanasta/SeccionCanasta';
import AvisoAdmision from './AvisoAdmision/AvisoAdmision';
import {
  CATALOGO_CUPS, EQUIPOS, ROLES_PERSONAL, SALAS_PROG,
} from '@/hooks/ProgramacionSalaCirugias/gestion/catalogos';
import {
  bloquesDeSala, cabe, disponibilidad, mapaOcupado, primeraLibre, rangoLabel, reubicar,
} from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';
import { esAmbulatorio, listaProcedimientos } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';
import { evaluarSolicitud } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import {
  getSolicitud, marcarProgramada, setAviso,
} from '@/hooks/ProgramacionSalaCirugias/gestion/store';
import { addDias, fechaISO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

const EQUIPO_EXTRA = { id: 'x1', nombre: '[Equipo adicional]', ocupado: [] };

// Duración inicial (en franjas de 30 min): suma del tiempo estimado de los
// procedimientos; las solicitudes de ejemplo lo toman del catálogo CUPS.
function duracionInicial(solicitud) {
  const min = listaProcedimientos(solicitud).reduce((acc, p) => {
    const t = p.tiempo ?? CATALOGO_CUPS.find((c) => p.nombre.startsWith(c.nombre.split(' ')[0]))?.tiempo ?? 120;
    return acc + t;
  }, 0);
  return Math.min(12, Math.max(1, Math.round(min / 30)));
}

const salasDelDia = (fecha) => SALAS_PROG.map((s) => {
  const bloques = bloquesDeSala(s.id, fecha);
  return { ...s, bloques, mapa: mapaOcupado(bloques) };
});

// Primera sala/franja libre donde entra la cirugía; null si ninguna.
function ubicarInicial(fecha, dur) {
  for (const s of salasDelDia(fecha)) {
    const inicio = primeraLibre(s.mapa, dur);
    if (inicio !== -1) return { salaId: s.id, inicio };
  }
  return null;
}

// "Programar cirugía": asigna sala, hora, personal, equipos y canasta a una
// solicitud con la lista de chequeo completa. Al confirmar, la solicitud de
// canasta va a farmacia y, si el paciente es ambulatorio, se crea la admisión.
export default function ProgramarCirugia() {
  const router = useRouter();
  const id = useSearchParams().get('id');
  const [solicitud] = useState(() => getSolicitud(id));
  const listo = solicitud ? evaluarSolicitud(solicitud).estado === 'lista' : false;

  const [fecha, setFecha] = useState(() => solicitud?.fechaTentativa ?? fechaISO(new Date()));
  const [duracion, setDuracion] = useState(() => (solicitud ? duracionInicial(solicitud) : 4));
  const [seleccion, setSeleccion] = useState(() => (solicitud ? ubicarInicial(fecha, duracion) : null));
  const [aviso, setAvisoLocal] = useState(null);
  const [personal, setPersonal] = useState(() => ({
    cirujano: solicitud?.cirujano ?? '', anestesiologo: '', ayudante: '', instrumentador: '', circulante: '',
  }));
  const [equiposElegidos, setEquiposElegidos] = useState(() => new Set());
  const [extra, setExtra] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    return () => cleanupChrome?.();
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }

  const salas = salasDelDia(fecha);
  const salaElegida = salas.find((s) => s.id === seleccion?.salaId);
  const equipos = extra ? [...EQUIPOS, EQUIPO_EXTRA] : EQUIPOS;

  function handleElegir(salaId, inicio) {
    const sala = salas.find((s) => s.id === salaId);
    if (!cabe(sala.mapa, inicio, duracion)) {
      showToast('La cirugía no cabe en esa franja: elige otra con más tiempo libre.');
      return;
    }
    setAvisoLocal(null);
    setSeleccion({ salaId, inicio });
  }

  function handleDia(delta) {
    const [y, m, d] = fecha.split('-').map(Number);
    const nueva = fechaISO(addDias(new Date(y, m - 1, d), delta));
    const sala = salasDelDia(nueva).find((s) => s.id === seleccion?.salaId);
    setFecha(nueva);
    if (sala && cabe(sala.mapa, seleccion.inicio, duracion)) {
      setAvisoLocal(null);
      return;
    }
    const nuevaSel = ubicarInicial(nueva, duracion);
    setSeleccion(nuevaSel);
    setAvisoLocal(nuevaSel
      ? 'La franja anterior no está libre ese día: se ubicó en la primera disponible.'
      : 'No hay una franja libre para esta duración ese día.');
  }

  function handleDuracion(nueva) {
    if (!seleccion || !salaElegida) {
      setDuracion(nueva);
      return;
    }
    const mismaSala = reubicar(salaElegida.mapa, seleccion.inicio, nueva);
    if (mismaSala !== null) {
      setDuracion(nueva);
      setSeleccion({ salaId: seleccion.salaId, inicio: mismaSala });
      setAvisoLocal(mismaSala === seleccion.inicio
        ? null
        : `La nueva duración no cabía en la franja: se reubicó a las ${rangoLabel(mismaSala, nueva).slice(0, 5)} en ${salaElegida.nombre}.`);
      return;
    }
    const otra = ubicarInicial(fecha, nueva);
    if (otra) {
      setDuracion(nueva);
      setSeleccion(otra);
      setAvisoLocal(`${salaElegida.nombre} no tiene espacio para esa duración: se movió a ${SALAS_PROG.find((s) => s.id === otra.salaId).nombre}.`);
    } else {
      setAvisoLocal('No hay una franja libre para esa duración este día. Se mantiene la anterior.');
    }
  }

  // Cruces de horario que impiden programar.
  const conflictos = [];
  ROLES_PERSONAL.forEach(({ key, label }) => {
    if (estadoPersonal(key, personal[key], seleccion, duracion) === 'cruce') conflictos.push(`${label} (${personal[key]})`);
  });
  equipos.forEach((e) => {
    if (equiposElegidos.has(e.id) && seleccion && disponibilidad(e.ocupado, seleccion.inicio, duracion) === 'cruce') {
      conflictos.push(e.nombre);
    }
  });
  const puedeProgramar = Boolean(seleccion) && Boolean(personal.cirujano) && conflictos.length === 0;
  const bloqueo = !seleccion
    ? 'Elige una franja libre en la agenda.'
    : !personal.cirujano
      ? 'Asigna un cirujano.'
      : conflictos.length > 0 ? `Resuelve los cruces de horario: ${conflictos.join(', ')}.` : null;

  function handleProgramar() {
    if (!solicitud || !seleccion || !salaElegida || !puedeProgramar) return;
    marcarProgramada(solicitud.id);
    setAviso(
      `Cirugía programada: ${solicitud.paciente.nombre} · ${salaElegida.nombre} · ${rangoLabel(seleccion.inicio, duracion)}. `
      + `Canasta solicitada a farmacia${esAmbulatorio(solicitud) ? ' y admisión creada' : ''}.`,
    );
    router.push('/cirugia/gestion');
  }

  const cabecera = (
    <>
      <nav className="gc-breadcrumb" aria-label="Ruta de navegación">
        <Link href="/cirugia/gestion">Gestión de cirugías</Link>
        <LuChevronRight className="icon" aria-hidden="true" />
        <span aria-current="page">Programar cirugía</span>
      </nav>
      <div className="psc-page-header">
        <div>
          <h1>Programar cirugía</h1>
          <p>Asigna sala, hora, personal, equipos y canasta.</p>
        </div>
      </div>
    </>
  );

  let cuerpo;
  if (!solicitud || !listo) {
    cuerpo = (
      <div className="gc-card pcz-vacio" role="status">
        <p>{solicitud
          ? 'Esta solicitud todavía tiene requisitos obligatorios pendientes: completa su lista de chequeo para programarla.'
          : 'No encontramos la solicitud. Puede que ya esté programada.'}</p>
        <Button variant="secondary" onClick={() => router.push('/cirugia/gestion')}>Volver a Gestión de cirugías</Button>
      </div>
    );
  } else {
    cuerpo = (
      <>
        <FranjaPaciente solicitud={solicitud} />
        <div className="pcz-workspace">
          <AgendaSalas
            fecha={fecha}
            onDia={handleDia}
            salas={salas}
            seleccion={seleccion}
            duracion={duracion}
            onElegir={handleElegir}
          />
          <section className="gc-card pcz-datos" aria-label="Datos de la programación">
            <div className="pcz-datos-cuerpo">
              <h2 className="pcz-datos-titulo">Datos de la programación</h2>
              <SeccionFechaSala
                fecha={fecha}
                sala={salaElegida}
                seleccion={seleccion}
                duracion={duracion}
                onDuracion={handleDuracion}
                aviso={aviso}
              />
              <SeccionPersonal
                personal={personal}
                onChange={(rol, valor) => setPersonal((p) => ({ ...p, [rol]: valor }))}
                seleccion={seleccion}
                duracion={duracion}
              />
              <SeccionEquipos
                equipos={equipos}
                elegidos={equiposElegidos}
                onToggle={(eid) => setEquiposElegidos((prev) => {
                  const next = new Set(prev);
                  if (next.has(eid)) next.delete(eid);
                  else next.add(eid);
                  return next;
                })}
                onAgregar={() => {
                  setExtra(true);
                  setEquiposElegidos((prev) => new Set(prev).add(EQUIPO_EXTRA.id));
                }}
                seleccion={seleccion}
                duracion={duracion}
              />
              <SeccionCanasta
                procedimiento={solicitud.procedimiento}
                onVerAjustar={() => showToast('Detalle de la canasta: pantalla por conectar')}
              />
              <AvisoAdmision ambulatorio={esAmbulatorio(solicitud)} />
            </div>
            <footer className="pcz-footer">
              {bloqueo && <p className="pcz-bloqueo" id="pcz-bloqueo">{bloqueo}</p>}
              <div className="pcz-botones">
                <Button variant="secondary" onClick={() => router.push('/cirugia/gestion')}>Cancelar</Button>
                <Button
                  icon={LuPackageCheck}
                  className="pcz-programar"
                  disabled={!puedeProgramar}
                  aria-describedby={bloqueo ? 'pcz-bloqueo' : undefined}
                  onClick={handleProgramar}
                >
                  Programar y solicitar canasta
                </Button>
              </div>
            </footer>
          </section>
        </div>
      </>
    );
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Programación sala de cirugías"
          page="Programar cirugía"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content pcz-content">
          {cabecera}
          {cuerpo}
        </div>
      </div>

      <div className={`psc-toast${toast ? ' show' : ''}`} role="status">
        <span className="psc-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
