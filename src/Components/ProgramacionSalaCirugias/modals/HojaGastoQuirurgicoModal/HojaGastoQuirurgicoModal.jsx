'use client';

import { useEffect, useRef, useState } from 'react';
import {
  LuChevronsDown, LuChevronsUp, LuCircle, LuCircleCheck, LuClipboardList, LuLock, LuLockOpen, LuPrinter,
} from 'react-icons/lu';
import './HojaGastoQuirurgicoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import PatientBanner from '@/Components/PatientBanner/PatientBanner';
import TiemposSection from './secciones/TiemposSection/TiemposSection';
import ProcedimientosSection from './secciones/ProcedimientosSection/ProcedimientosSection';
import PersonalSection from './secciones/PersonalSection/PersonalSection';
import InsumosSection from './secciones/InsumosSection/InsumosSection';
import MedicamentosSection from './secciones/MedicamentosSection/MedicamentosSection';
import ImplantesSection from './secciones/ImplantesSection/ImplantesSection';
import EquiposSection from './secciones/EquiposSection/EquiposSection';
import ConteoSection from './secciones/ConteoSection/ConteoSection';
import FirmasSection from './secciones/FirmasSection/FirmasSection';
import ResumenSection from './secciones/ResumenSection/ResumenSection';
import FirmaPinModal from './subventanas/FirmaPinModal/FirmaPinModal';
import ConfirmarCierreModal from './subventanas/ConfirmarCierreModal/ConfirmarCierreModal';
import ReabrirHojaModal from './subventanas/ReabrirHojaModal/ReabrirHojaModal';
import { SeccionesContext } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/SeccionesContext';
import {
  HOJA_ESTADO_LABEL, cerrarHoja, construirHojaInicial, firmarHoja, guardarHoja,
  horaAhora, obtenerHojaGuardada, progresoHoja, reabrirHoja, validarCierre,
} from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';
import { SALAS, fechaHoraLocalISO, fechaHoraRangoLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Índice lateral: `progreso` es la clave de progresoHoja().porSeccion (sin clave = sin
// verificación, no muestra ícono). Cada entrada hace scroll a la sección con ese id y se
// marca con punto rojo si el último intento de cierre dejó un error en
// alguna de las `secciones` de validarCierre que agrupa.
const NAV = [
  { id: 'hgq-tiempos', label: 'Tiempos y anestesia', errores: ['tiempos', 'anestesia'], progreso: 'tiempos' },
  { id: 'hgq-conteo', label: 'Conteo quirúrgico', errores: ['conteo'], progreso: 'conteo' },
  { id: 'hgq-personal', label: 'Equipo quirúrgico', errores: ['personal'], progreso: 'personal' },
  { id: 'hgq-procedimientos', label: 'Procedimientos', errores: ['procedimientos'], progreso: 'procedimientos' },
  { id: 'hgq-insumos', label: 'Insumos y materiales', errores: ['insumos'], progreso: 'insumos' },
  { id: 'hgq-medicamentos', label: 'Medicamentos', errores: [] },
  { id: 'hgq-implantes', label: 'Implantes', errores: ['implantes'], progreso: 'implantes' },
  { id: 'hgq-equipos', label: 'Equipos usados', errores: [] },
  { id: 'hgq-firmas', label: 'Observaciones y firmas', errores: ['firmas'], progreso: 'firmas' },
  { id: 'hgq-resumen', label: 'Resumen', errores: [] },
];

const iniciales = (nombre = '') => nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

const FIRMA_ROL_LABEL = { circulante: 'Circulante', instrumentadora: 'Instrumentadora', cirujano: 'Cirujano' };

const ahoraISO =() => fechaHoraLocalISO(new Date());
// Scroll solo del cuerpo (.hgq-body), no scrollIntoView: cuando el cuerpo ya no puede
// desplazarse más (secciones plegadas, poco contenido) scrollIntoView sigue con el
// ancestro `.hgq-card` (overflow:hidden) y esconde banner y título. El retraso espera
// la animación de apertura/cierre de las secciones (.2 s en SeccionHoja.css), que
// mueve la posición del destino.
const irA = (id) => setTimeout(() => {
  const el = document.getElementById(id);
  const cuerpo = el?.closest('.hgq-body');
  if (!el || !cuerpo) return;
  const delta = el.getBoundingClientRect().top - cuerpo.getBoundingClientRect().top - 8;
  cuerpo.scrollTo({ top: cuerpo.scrollTop + delta, behavior: 'smooth' });
}, 260);

export default function HojaGastoQuirurgicoModal({ cirugia, onClose }) {
  const [hoja, setHoja] = useState(() => obtenerHojaGuardada(cirugia.id) ?? construirHojaInicial(cirugia));
  const [errores, setErrores] = useState([]);
  const [aviso, setAviso] = useState('');
  const [guardadoEn, setGuardadoEn] = useState('');
  // Subventana abierta: { tipo: 'firma', rol } | { tipo: 'cierre' } | { tipo: 'reabrir' } | null.
  const [subventana, setSubventana] = useState(null);
  // Secciones plegadas { [id]: boolean }; solo en memoria (al reabrir todo arranca abierto).
  const [plegadas, setPlegadas] = useState({});
  const hojaInicialRef = useRef(hoja);
  const readOnly = hoja.estado === 'cerrada';
  const nReaperturas = hoja.reaperturas?.length ?? 0;
  const seccionesConError = errores.map((e) => e.seccion);
  const set = (clave, valor) => setHoja((h) => ({ ...h, [clave]: valor }));
  const nombreDe = (rol) => hoja.personal.find((f) => f.rol === rol)?.nombre ?? '';

  // Cerrar la ventana guarda el borrador: no se pierde lo digitado.
  function cerrar() {
    if (!readOnly) guardarHoja(hoja);
    onClose();
  }

  // El listener de Escape se registra una sola vez y llama siempre a la
  // versión más reciente de `cerrar` (que ve el `hoja` actual) vía ref.
  const cerrarRef = useRef(cerrar);
  useEffect(() => {
    cerrarRef.current = cerrar;
  });
  // Con una subventana abierta, Escape cierra solo esa (su propio listener).
  useEffect(() => {
    if (subventana) return undefined;
    function onKeyDown(e) {
      if (e.key === 'Escape') cerrarRef.current?.();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [subventana]);

  // Autoguardado: debounce de 800 ms ante cualquier cambio de la hoja.
  useEffect(() => {
    if (hoja.estado === 'cerrada' || hoja === hojaInicialRef.current) return undefined;
    const t = setTimeout(() => {
      guardarHoja(hoja);
      setGuardadoEn(horaAhora());
    }, 800);
    return () => clearTimeout(t);
  }, [hoja]);

  const progreso = progresoHoja(hoja);
  const todasPlegadas = NAV.every((n) => plegadas[n.id]);
  const alternar = (id) => setPlegadas((p) => ({ ...p, [id]: !p[id] }));
  const plegarTodo = () => setPlegadas(Object.fromEntries(NAV.map((n) => [n.id, !todasPlegadas])));
  const irAbriendo = (id) => {
    setPlegadas((p) => ({ ...p, [id]: false }));
    irA(id);
  };
  // Tono del ícono de cada sección: error > completa > por defecto.
  const tonos = Object.fromEntries(NAV.map((n) => [
    n.id,
    n.errores.some((s) => seccionesConError.includes(s)) ? 'error'
      : (n.progreso && progreso.porSeccion[n.progreso] ? 'ok' : 'default'),
  ]));
  const sala = SALAS.find((x) => x.value === cirugia.salaId)?.descripcion;
  const pac = cirugia.paciente;
  const patientBanner = pac ? {
    nombre: pac.nombre,
    // PatientBanner ya antepone "CC": el dato de la cirugía viene como "CC 63.221.940".
    documento: (pac.documento ?? '').replace(/^CC\s*/i, ''),
    iniciales: iniciales(pac.nombre),
    sexo: pac.sexo,
    edad: pac.edad,
    eps: pac.aseguradora,
  } : null;

  // Abre las secciones con error y hace scroll a la primera.
  function mostrarErrores(errs) {
    setErrores(errs);
    setAviso('');
    const secs = errs.map((e) => e.seccion);
    setPlegadas((p) => {
      const sig = { ...p };
      NAV.forEach((n) => { if (n.errores.some((s) => secs.includes(s))) sig[n.id] = false; });
      return sig;
    });
    const primera = NAV.find((n) => n.errores.includes(errs[0]?.seccion));
    if (primera) irA(primera.id);
  }

  // Con errores: resumen + scroll al primero. Sin errores: pide confirmación.
  function pedirCierre() {
    const errs = validarCierre(hoja);
    if (errs.length > 0) {
      mostrarErrores(errs);
      return;
    }
    setSubventana({ tipo: 'cierre' });
  }

  function cerrarLaHoja() {
    setSubventana(null);
    const r = cerrarHoja(hoja, ahoraISO());
    if (!r.ok) {
      mostrarErrores(r.errores);
      return;
    }
    setErrores([]);
    setHoja(r.hoja);
    guardarHoja(r.hoja);
    setAviso('Hoja cerrada · pendiente de liquidación.');
  }

  function reabrir(motivo) {
    const r = reabrirHoja(hoja, motivo, ahoraISO());
    if (!r.ok) return;
    setSubventana(null);
    setErrores([]);
    setHoja(r.hoja);
    guardarHoja(r.hoja);
    setAviso('Hoja reabierta. Las firmas se invalidaron; vuelve a firmar al terminar.');
  }

  const cerrarSubventana = () => setSubventana(null);

  return (
    <>
    <div className="modal-overlay open" role="presentation" onClick={cerrar}>
      <div
        className="modal-card hgq-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hgq-title"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          icon={LuClipboardList}
          tone="primary"
          title="Hoja de gasto quirúrgico"
          titleId="hgq-title"
          subtitle={`Programación ${cirugia.id} · ${cirugia.paciente?.nombre ?? ''}${nReaperturas > 0 ? ` · Reabierta ${nReaperturas} ${nReaperturas === 1 ? 'vez' : 'veces'}` : ''}`}
          onClose={cerrar}
          closeLabel="Cerrar hoja de gasto"
          trailing={<Badge tone={readOnly ? 'success' : 'warn'}>{HOJA_ESTADO_LABEL[hoja.estado]}</Badge>}
        />

        <div className="hgq-banner">
          <PatientBanner
            variant="cirugia"
            patient={patientBanner}
            context={{
              numeroProgramacion: cirugia.id,
              procedimientoPrincipal: hoja.procedimientos[0]?.nombre ?? cirugia.procedimientos?.[0]?.nombre,
              sala,
              fechaHoraProgramada: fechaHoraRangoLabel(cirugia.fecha, cirugia.horaInicio, cirugia.horaFin),
              numeroHoja: hoja.numero,
              servicio: cirugia.servicio,
              tipoCirugia: cirugia.tipoCirugia,
            }}
            secondRowExtra={(
              <div className="hgq-banner-admision">
                <label htmlFor="hgq-admision" className="hgq-field-label">N° de admisión</label>
                <input
                  id="hgq-admision"
                  className="hgq-input"
                  value={hoja.admision ?? ''}
                  disabled={readOnly}
                  onChange={(e) => set('admision', e.target.value)}
                />
              </div>
            )}
          />
        </div>

        <div className="hgq-layout">
          <nav className="hgq-nav" aria-label="Secciones de la hoja">
            {NAV.map((n) => (
              <button key={n.id} type="button" className="hgq-nav-item" onClick={() => irAbriendo(n.id)}>
                <span className="hgq-nav-label">
                  {n.progreso ? (progreso.porSeccion[n.progreso]
                    ? <LuCircleCheck className="icon hgq-nav-ok" aria-label="Completa" />
                    : <LuCircle className="icon hgq-nav-pend" aria-label="Pendiente" />)
                    : <span className="hgq-nav-spacer" aria-hidden="true" />}
                  {n.label}
                </span>
                {n.errores.some((s) => seccionesConError.includes(s)) && <span className="hgq-nav-dot" aria-label="Con errores" />}
              </button>
            ))}
          </nav>

          <div className="hgq-body">
            <SeccionesContext.Provider value={{ plegadas, tonos, alternar }}>
            <div className="hgq-body-acciones">
              <Button variant="secondary" size="sm" icon={todasPlegadas ? LuChevronsDown : LuChevronsUp} onClick={plegarTodo}>
                {todasPlegadas ? 'Desplegar todo' : 'Plegar todo'}
              </Button>
            </div>
            {errores.length > 0 && (
              <div className="hgq-errores" role="alert">
                <strong>No se puede cerrar la hoja:</strong>
                <ul>{errores.map((e) => <li key={e.mensaje}>{e.mensaje}</li>)}</ul>
              </div>
            )}
            {aviso && <div className="hgq-aviso" role="status">{aviso}</div>}

            <TiemposSection
              tiempos={hoja.tiempos}
              anestesia={hoja.anestesia}
              programado={hoja.programado}
              onChangeTiempos={(v) => set('tiempos', v)}
              onChangeAnestesia={(v) => set('anestesia', v)}
              readOnly={readOnly}
            />
            <ConteoSection rows={hoja.conteo} onChange={(v) => set('conteo', v)} readOnly={readOnly} />
            <PersonalSection rows={hoja.personal} onChange={(v) => set('personal', v)} readOnly={readOnly} />
            <ProcedimientosSection rows={hoja.procedimientos} onChange={(v) => set('procedimientos', v)} readOnly={readOnly} />
            <InsumosSection rows={hoja.insumos} onChange={(v) => set('insumos', v)} readOnly={readOnly} />
            <MedicamentosSection rows={hoja.medicamentos} onChange={(v) => set('medicamentos', v)} readOnly={readOnly} />
            <ImplantesSection rows={hoja.implantes} onChange={(v) => set('implantes', v)} readOnly={readOnly} />
            <EquiposSection rows={hoja.equipos} onChange={(v) => set('equipos', v)} readOnly={readOnly} />
            <FirmasSection
              observaciones={hoja.observaciones}
              onChangeObservaciones={(v) => set('observaciones', v)}
              nombres={{ circulante: nombreDe('Circulante'), instrumentadora: nombreDe('Instrumentadora'), cirujano: nombreDe('Cirujano') }}
              firmas={hoja.firmas}
              onPedirFirma={(rol) => setSubventana({ tipo: 'firma', rol })}
              onQuitarFirma={(rol) => setHoja((h) => firmarHoja(h, rol, null))}
              reaperturas={hoja.reaperturas}
              readOnly={readOnly}
             
            />
            <ResumenSection hoja={hoja} />
            </SeccionesContext.Provider>
          </div>
        </div>

        <div className="hgq-footer">
          <div className="hgq-progreso">
            <span className="hgq-progreso-texto">{progreso.completas} de {progreso.total} secciones listas</span>
            <div
              className="hgq-progreso-barra"
              role="progressbar"
              aria-label="Secciones listas"
              aria-valuemin={0}
              aria-valuenow={progreso.completas}
              aria-valuemax={progreso.total}
            >
              <div className="hgq-progreso-relleno" style={{ width: `${(progreso.completas / progreso.total) * 100}%` }} />
            </div>
          </div>
          {guardadoEn && !readOnly && <span className="hgq-guardado" role="status">Guardado · {guardadoEn}</span>}
          <div className="hgq-footer-acciones">
            <Button variant="secondary" icon={LuPrinter} onClick={() => window.print()}>Imprimir</Button>
            {readOnly
              ? <Button variant="secondary" icon={LuLockOpen} onClick={() => setSubventana({ tipo: 'reabrir' })}>Reabrir hoja</Button>
              : <Button icon={LuLock} onClick={pedirCierre}>Cerrar hoja</Button>}
          </div>
        </div>
      </div>
    </div>

    {/* Subventanas fuera del .modal-card (su transform rompe el position:fixed). */}
    {subventana?.tipo === 'firma' && (
      <FirmaPinModal
        rol={FIRMA_ROL_LABEL[subventana.rol] ?? subventana.rol}
        nombre={nombreDe(FIRMA_ROL_LABEL[subventana.rol])}
        onClose={cerrarSubventana}
        onConfirmar={() => {
          const rol = subventana?.rol;
          setSubventana(null);
          if (rol) setHoja((h) => firmarHoja(h, rol, ahoraISO()));
        }}
      />
    )}
    {subventana?.tipo === 'cierre' && (
      <ConfirmarCierreModal hoja={hoja} onClose={cerrarSubventana} onConfirmar={cerrarLaHoja} />
    )}
    {subventana?.tipo === 'reabrir' && (
      <ReabrirHojaModal onClose={cerrarSubventana} onConfirmar={reabrir} />
    )}
    </>
  );
}
