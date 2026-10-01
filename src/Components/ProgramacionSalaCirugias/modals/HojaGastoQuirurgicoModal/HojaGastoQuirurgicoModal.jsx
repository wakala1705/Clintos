'use client';

import { useEffect, useRef, useState } from 'react';
import {
  LuClipboardList, LuLock, LuPrinter, LuSave,
} from 'react-icons/lu';
import './HojaGastoQuirurgicoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import EncabezadoSection from './secciones/EncabezadoSection/EncabezadoSection';
import TiemposSection from './secciones/TiemposSection/TiemposSection';
import ProcedimientosSection from './secciones/ProcedimientosSection/ProcedimientosSection';
import HonorariosSection from './secciones/HonorariosSection/HonorariosSection';
import InsumosSection from './secciones/InsumosSection/InsumosSection';
import MedicamentosSection from './secciones/MedicamentosSection/MedicamentosSection';
import ImplantesSection from './secciones/ImplantesSection/ImplantesSection';
import EquiposSalaSection from './secciones/EquiposSalaSection/EquiposSalaSection';
import ConteoSection from './secciones/ConteoSection/ConteoSection';
import FirmasSection from './secciones/FirmasSection/FirmasSection';
import ResumenSection from './secciones/ResumenSection/ResumenSection';
import {
  HOJA_ESTADO_LABEL, cerrarHoja, construirHojaInicial, firmarHoja, formatoCOP, guardarHoja,
  obtenerHojaGuardada, totalesHoja,
} from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';
import { fechaHoraLocalISO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Índice lateral: cada entrada hace scroll a la sección con ese id y se
// marca con punto rojo si el último intento de cierre dejó un error en
// alguna de las `secciones` de validarCierre que agrupa.
const NAV = [
  { id: 'hgq-encabezado', label: 'Encabezado', errores: [] },
  { id: 'hgq-tiempos', label: 'Tiempos y anestesia', errores: ['tiempos', 'anestesia'] },
  { id: 'hgq-procedimientos', label: 'Procedimientos', errores: ['procedimientos'] },
  { id: 'hgq-honorarios', label: 'Equipo y honorarios', errores: ['honorarios'] },
  { id: 'hgq-insumos', label: 'Insumos y materiales', errores: ['insumos'] },
  { id: 'hgq-medicamentos', label: 'Medicamentos', errores: [] },
  { id: 'hgq-implantes', label: 'Implantes', errores: ['implantes'] },
  { id: 'hgq-equipos', label: 'Equipos y sala', errores: [] },
  { id: 'hgq-conteo', label: 'Conteo quirúrgico', errores: ['conteo'] },
  { id: 'hgq-firmas', label: 'Observaciones y firmas', errores: ['firmas'] },
  { id: 'hgq-resumen', label: 'Resumen', errores: [] },
];

const ahoraISO = () => fechaHoraLocalISO(new Date());
const irA = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function HojaGastoQuirurgicoModal({ cirugia, onClose }) {
  const [hoja, setHoja] = useState(() => obtenerHojaGuardada(cirugia.id) ?? construirHojaInicial(cirugia));
  const [errores, setErrores] = useState([]);
  const [aviso, setAviso] = useState('');
  const readOnly = hoja.estado === 'cerrada';
  const totales = totalesHoja(hoja);
  const seccionesConError = errores.map((e) => e.seccion);
  const set = (clave, valor) => setHoja((h) => ({ ...h, [clave]: valor }));
  const nombreDe = (rol) => hoja.honorarios.find((f) => f.rol === rol)?.nombre ?? '';

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
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') cerrarRef.current?.();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  function guardarBorrador() {
    guardarHoja(hoja);
    setAviso('Borrador guardado.');
  }

  function cerrarLaHoja() {
    const r = cerrarHoja(hoja, ahoraISO());
    if (!r.ok) {
      setErrores(r.errores);
      setAviso('');
      const primera = NAV.find((n) => n.errores.includes(r.errores[0]?.seccion));
      if (primera) irA(primera.id);
      return;
    }
    setErrores([]);
    setHoja(r.hoja);
    guardarHoja(r.hoja);
    setAviso('Hoja cerrada. Cargos generados en la cuenta de la admisión.');
  }

  return (
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
          subtitle={`Programación ${cirugia.id} · ${cirugia.paciente?.nombre ?? ''}`}
          onClose={cerrar}
          closeLabel="Cerrar hoja de gasto"
          trailing={<Badge tone={readOnly ? 'success' : 'warn'}>{HOJA_ESTADO_LABEL[hoja.estado]}</Badge>}
        />

        <div className="hgq-layout">
          <nav className="hgq-nav" aria-label="Secciones de la hoja">
            {NAV.map((n) => (
              <button key={n.id} type="button" className="hgq-nav-item" onClick={() => irA(n.id)}>
                {n.label}
                {n.errores.some((s) => seccionesConError.includes(s)) && <span className="hgq-nav-dot" aria-label="Con errores" />}
              </button>
            ))}
          </nav>

          <div className="hgq-body">
            {errores.length > 0 && (
              <div className="hgq-errores" role="alert">
                <strong>No se puede cerrar la hoja:</strong>
                <ul>{errores.map((e) => <li key={e.mensaje}>{e.mensaje}</li>)}</ul>
              </div>
            )}
            {aviso && <div className="hgq-aviso" role="status">{aviso}</div>}

            <EncabezadoSection cirugia={cirugia} hoja={hoja} admision={hoja.admision} onChangeAdmision={(v) => set('admision', v)} readOnly={readOnly} />
            <TiemposSection
              tiempos={hoja.tiempos}
              anestesia={hoja.anestesia}
              onChangeTiempos={(v) => set('tiempos', v)}
              onChangeAnestesia={(v) => set('anestesia', v)}
              readOnly={readOnly}
              errorTiempos={seccionesConError.includes('tiempos')}
              errorAnestesia={seccionesConError.includes('anestesia')}
            />
            <ProcedimientosSection rows={hoja.procedimientos} onChange={(v) => set('procedimientos', v)} readOnly={readOnly} error={seccionesConError.includes('procedimientos')} />
            <HonorariosSection rows={hoja.honorarios} onChange={(v) => set('honorarios', v)} readOnly={readOnly} error={seccionesConError.includes('honorarios')} />
            <InsumosSection rows={hoja.insumos} onChange={(v) => set('insumos', v)} readOnly={readOnly} error={seccionesConError.includes('insumos')} />
            <MedicamentosSection rows={hoja.medicamentos} onChange={(v) => set('medicamentos', v)} readOnly={readOnly} />
            <ImplantesSection rows={hoja.implantes} onChange={(v) => set('implantes', v)} readOnly={readOnly} error={seccionesConError.includes('implantes')} />
            <EquiposSalaSection
              equipos={hoja.equipos}
              derechosSala={hoja.derechosSala}
              onChangeEquipos={(v) => set('equipos', v)}
              onChangeDerechos={(v) => set('derechosSala', v)}
              readOnly={readOnly}
            />
            <ConteoSection rows={hoja.conteo} onChange={(v) => set('conteo', v)} readOnly={readOnly} error={seccionesConError.includes('conteo')} />
            <FirmasSection
              observaciones={hoja.observaciones}
              onChangeObservaciones={(v) => set('observaciones', v)}
              nombres={{ circulante: nombreDe('Circulante'), instrumentadora: nombreDe('Instrumentadora'), cirujano: nombreDe('Cirujano') }}
              firmas={hoja.firmas}
              onFirmar={(rol, iso) => setHoja((h) => firmarHoja(h, rol, iso))}
              ahoraISO={ahoraISO}
              readOnly={readOnly}
              error={seccionesConError.includes('firmas')}
            />
            <ResumenSection totales={totales} />
          </div>
        </div>

        <div className="hgq-footer">
          <div className="hgq-footer-total">
            <span>Total de la hoja</span>
            <strong>{formatoCOP(totales.total)}</strong>
          </div>
          <div className="hgq-footer-acciones">
            <Button variant="secondary" icon={LuPrinter} onClick={() => window.print()}>Imprimir</Button>
            {!readOnly && <Button variant="secondary" icon={LuSave} onClick={guardarBorrador}>Guardar borrador</Button>}
            {!readOnly && <Button icon={LuLock} onClick={cerrarLaHoja}>Cerrar hoja</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
