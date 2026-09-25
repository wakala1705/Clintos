'use client';

import { useRef, useState } from 'react';
import {
  LuCheck, LuCircleArrowLeft, LuCirclePlus, LuPackageMinus, LuPencil, LuPrinter, LuSave, LuSearch,
  LuTrash2, LuX,
} from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import {
  DEVOLUCION_ESTADO_LABEL, cantidadDevolvible, fechaHoraLabel, fechaISO,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import './DevolucionesCirugiaModal.css';

// Ventana "Devoluciones en Cirugías" (réplica de la ventana legada, abierta
// desde "Devolver insumos" en la tab Insumos del detalle). Maestro-detalle:
// devoluciones de la cirugía arriba, ítems de la seleccionada abajo.
// - Buscar aplica los filtros Desde/Usuario (Num Cirugía es la cirugía de
//   origen, fijo).
// - Nuevo/Modificar pasan la tabla de ítems a edición: una fila por insumo
//   entregado con la cantidad a devolver (tope = lo devolvible). Guardar la
//   deja confirmada por farmacia en el acto (sin paso "pendiente", decisión
//   explícita) y descuenta del insumo.
// - Eliminar anula la devolución (queda en gris, deja de contar).
// - Imprimir todavía sin acción.
// Los íconos de lupa/orden de los encabezados de la referencia se omiten
// (mismo criterio que ListadoProgramacionesModal).
const COLUMNAS_DEVOLUCIONES = [
  { label: 'Consecutivo' },
  { label: 'Usuario' },
  { label: 'Fecha' },
  { label: 'Aplicada', align: 'dvm-center' },
  { label: 'Confirmada', align: 'dvm-center' },
];
const COLUMNAS_ITEMS = [
  { label: 'Item' },
  { label: 'ID' },
  { label: 'Descripción', wide: true },
  { label: 'Cant. Devuelta', align: 'dvm-right' },
  { label: 'Man. Lote', align: 'dvm-center' },
  { label: 'No. Lote' },
];
// Leyenda de colores de estado de la referencia (el estado de cada
// devolución se marca con el color de la fila).
const LEYENDA_ORDEN = ['confirmada', 'pendiente', 'no-completada', 'anulada'];

const consecutivoLabel = (n) => String(n).padStart(4, '0');

function thClass(col) {
  return [col.align, col.wide && 'dvm-wide'].filter(Boolean).join(' ') || undefined;
}

export default function DevolucionesCirugiaModal({
  cirugia, onGuardar, onAnular, onClose,
}) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);

  // "Desde" arranca en la fecha de la cirugía, o en hoy si la cirugía es
  // futura: las devoluciones se registran con la fecha actual y no deben
  // quedar filtradas fuera al abrir.
  const hoy = fechaISO(new Date());
  const desdeInicial = cirugia.fecha < hoy ? cirugia.fecha : hoy;
  const [borrador, setBorrador] = useState({ desde: desdeInicial, usuario: 'CLINTOS' });
  const [filtros, setFiltros] = useState(borrador);
  const [seleccionada, setSeleccionada] = useState(null);
  // null = viendo; { consecutivo?, cantidades: { [nombre]: string } } = editando
  const [edicion, setEdicion] = useState(null);
  const [error, setError] = useState(null);
  const [confirmandoAnular, setConfirmandoAnular] = useState(false);

  const devoluciones = (cirugia.devoluciones ?? []).filter((d) => (
    (!filtros.desde || d.fecha.slice(0, 10) >= filtros.desde)
    && (!filtros.usuario.trim() || d.usuario.toLowerCase().includes(filtros.usuario.trim().toLowerCase()))
  ));
  const actual = devoluciones.find((d) => d.consecutivo === seleccionada) ?? null;
  const entregados = cirugia.canasta.items.filter((i) => i.solicitudFarmacia === 'entregado');
  const hayDevolvible = entregados.some((i) => cantidadDevolvible(cirugia, i) > 0);

  function seleccionar(consecutivo) {
    if (edicion) return;
    setSeleccionada(consecutivo);
    setConfirmandoAnular(false);
  }

  function iniciarEdicion(devolucion) {
    const cantidades = {};
    entregados.forEach((i) => {
      const previa = devolucion?.items.find((l) => l.nombre === i.nombre)?.cantidad;
      cantidades[i.nombre] = previa ? String(previa) : '';
    });
    setEdicion({ consecutivo: devolucion?.consecutivo, cantidades });
    setError(null);
    setConfirmandoAnular(false);
  }

  function guardar() {
    const lineas = Object.entries(edicion?.cantidades ?? {}).map(([nombre, v]) => ({
      nombre, cantidad: v === '' ? 0 : Number(v),
    }));
    const resultado = onGuardar({ consecutivo: edicion?.consecutivo, lineas });
    if (resultado.error) {
      setError(resultado.error);
      return;
    }
    setSeleccionada(resultado.consecutivo);
    setEdicion(null);
    setError(null);
  }

  function anular() {
    onAnular(actual?.consecutivo);
    setConfirmandoAnular(false);
  }

  function handleKeyDown(e) {
    if (e.key !== 'Escape') return;
    if (edicion) {
      setEdicion(null);
      setError(null);
    } else {
      onClose();
    }
  }

  const filasItems = edicion ? entregados : (actual?.items ?? []);

  return (
    <div className="modal-overlay open" onKeyDown={handleKeyDown}>
      <div ref={cardRef} className="modal-card dvm-modal-card" role="dialog" aria-modal="true" aria-labelledby="dvm-title">
        <ModalHeader
          icon={LuPackageMinus}
          tone="primary"
          title="Devoluciones en Cirugías"
          titleId="dvm-title"
          onClose={onClose}
        />
        <div className="modal-body dvm-body">
          <form
            className="dvm-filtros"
            onSubmit={(e) => {
              e.preventDefault();
              setFiltros(borrador);
            }}
          >
            <div className="form-field">
              <label htmlFor="dvm-desde">Desde</label>
              <input
                id="dvm-desde"
                type="date"
                value={borrador.desde}
                onChange={(e) => setBorrador((b) => ({ ...b, desde: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label htmlFor="dvm-num">Num Cirugía</label>
              <input id="dvm-num" type="text" value={cirugia.id} readOnly />
            </div>
            <div className="dvm-spacer" />
            <div className="form-field">
              <label htmlFor="dvm-usuario">Usuario</label>
              <input
                id="dvm-usuario"
                type="text"
                value={borrador.usuario}
                onChange={(e) => setBorrador((b) => ({ ...b, usuario: e.target.value }))}
              />
            </div>
            <Button type="submit" variant="secondary-accent" icon={LuSearch} disabled={!!edicion}>Buscar</Button>
          </form>

          <div className="dvm-table-wrap">
            <table className="dvm-table" aria-label="Devoluciones">
              <thead>
                <tr>{COLUMNAS_DEVOLUCIONES.map((c) => <th key={c.label} className={thClass(c)}>{c.label}</th>)}</tr>
              </thead>
              <tbody>
                {devoluciones.length === 0 && (
                  <tr>
                    <td colSpan={COLUMNAS_DEVOLUCIONES.length} className="dvm-empty">
                      {(cirugia.devoluciones ?? []).length === 0
                        ? 'No hay devoluciones registradas para esta cirugía.'
                        : 'Ninguna devolución coincide con los filtros.'}
                    </td>
                  </tr>
                )}
                {devoluciones.map((d) => {
                  const confirmada = d.estado === 'confirmada';
                  return (
                    <tr
                      key={d.consecutivo}
                      className={`dvm-row dvm-row-${d.estado}${seleccionada === d.consecutivo ? ' selected' : ''}`}
                      tabIndex={edicion ? -1 : 0}
                      aria-selected={seleccionada === d.consecutivo}
                      title={DEVOLUCION_ESTADO_LABEL[d.estado]}
                      onClick={() => seleccionar(d.consecutivo)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          seleccionar(d.consecutivo);
                        }
                      }}
                    >
                      <td>{consecutivoLabel(d.consecutivo)}</td>
                      <td>{d.usuario}</td>
                      <td>{fechaHoraLabel(d.fecha)}</td>
                      <td className="dvm-center">{confirmada ? <LuCheck className="dvm-check" aria-label="Sí" /> : '—'}</td>
                      <td className="dvm-center">{confirmada ? <LuCheck className="dvm-check" aria-label="Sí" /> : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="dvm-table-wrap">
            <table className="dvm-table" aria-label="Ítems de la devolución">
              <thead>
                <tr>{COLUMNAS_ITEMS.map((c) => <th key={c.label} className={thClass(c)}>{c.label}</th>)}</tr>
              </thead>
              <tbody>
                {filasItems.length === 0 && (
                  <tr>
                    <td colSpan={COLUMNAS_ITEMS.length} className="dvm-empty">
                      {edicion ? 'No hay insumos entregados para devolver.' : 'Selecciona una devolución para ver sus ítems.'}
                    </td>
                  </tr>
                )}
                {filasItems.map((item, idx) => {
                  const maximo = edicion ? cantidadDevolvible(cirugia, item, { excepto: edicion?.consecutivo }) : null;
                  return (
                    <tr key={item.nombre}>
                      <td>{idx + 1}</td>
                      <td>{item.codigo || '—'}</td>
                      <td className="dvm-desc">{item.nombre}</td>
                      <td className="dvm-right">
                        {edicion ? (
                          <span className="dvm-cant">
                            <input
                              type="number"
                              min={0}
                              max={maximo}
                              step={1}
                              inputMode="numeric"
                              disabled={maximo === 0}
                              value={edicion?.cantidades[item.nombre] ?? ''}
                              placeholder="0"
                              aria-label={`Cantidad a devolver de ${item.nombre}`}
                              onChange={(e) => {
                                const v = e.target.value;
                                setEdicion((ed) => ({ ...ed, cantidades: { ...ed.cantidades, [item.nombre]: v } }));
                              }}
                            />
                            <span className="dvm-max">de {maximo}</span>
                          </span>
                        ) : item.cantidad}
                      </td>
                      <td className="dvm-center">{item.manejaLote ? 'Sí' : 'No'}</td>
                      <td>{item.noLote || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {error && <p className="dvm-error" role="alert">{error}</p>}
          {confirmandoAnular && actual && (
            <div className="dvm-confirmar" role="alert">
              <span>¿Anular la devolución {consecutivoLabel(actual?.consecutivo)}? Sus cantidades dejarán de contar como devueltas.</span>
              <Button variant="secondary" size="sm" onClick={() => setConfirmandoAnular(false)}>No</Button>
              <Button variant="danger" size="sm" icon={LuTrash2} onClick={anular}>Anular</Button>
            </div>
          )}
        </div>
        <div className="modal-footer dvm-footer">
          <ul className="dvm-leyenda" aria-label="Estados de la devolución">
            {LEYENDA_ORDEN.map((estado) => (
              <li key={estado}>
                <span className={`dvm-swatch dvm-swatch-${estado}`} aria-hidden="true" />
                {DEVOLUCION_ESTADO_LABEL[estado]}
              </li>
            ))}
          </ul>
          <div className="dvm-acciones">
            {edicion ? (
              <>
                <Button variant="secondary" icon={LuX} onClick={() => { setEdicion(null); setError(null); }}>Cancelar</Button>
                <Button icon={LuSave} onClick={guardar}>Guardar devolución</Button>
              </>
            ) : (
              <>
                <Button variant="secondary-accent" icon={LuCirclePlus} disabled={!hayDevolvible} onClick={() => iniciarEdicion(null)}>Nuevo</Button>
                <Button variant="secondary-accent" icon={LuPencil} disabled={actual?.estado !== 'confirmada'} onClick={() => iniciarEdicion(actual)}>Modificar</Button>
                <Button variant="secondary-accent" icon={LuTrash2} disabled={actual?.estado !== 'confirmada'} onClick={() => setConfirmandoAnular(true)}>Eliminar</Button>
                <Button variant="secondary-accent" icon={LuPrinter}>Imprimir</Button>
                <Button variant="secondary" icon={LuCircleArrowLeft} onClick={onClose}>Salir</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
