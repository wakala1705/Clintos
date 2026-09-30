'use client';

import {
  LuCheck, LuMinus, LuPackageCheck, LuPlus, LuTriangleAlert, LuTruck,
} from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import {
  cantidadDespachada, cantidadRecibida, novedadItem, origenDiferencia, resumenCanasta,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { lineaRecepcion } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import ProgresoVerificacion from '../ProgresoVerificacion/ProgresoVerificacion';
import NovedadRecepcion from '../NovedadRecepcion/NovedadRecepcion';
import InsumosBuscador from '../InsumosBuscador/InsumosBuscador';
import './RecepcionTab.css';

// Pestaña "Recepción" del detalle. Un solo componente con 4 modos según el
// estado derivado de la canasta:
//  - despachada     -> editar: verificar cada insumo (click en la fila) y, solo
//                      si hace falta, "Ajustar" lo recibido.
//  - en-preparacion -> vista de avance de farmacia.
//  - sin-solicitar  -> aviso vacío.
//  - resto          -> lectura de lo recibido.
// `draft` (borrador por cirugía) lo guarda el orquestador para no perderlo al
// cambiar de cirugía; solo se persiste al confirmar (onRecibir).

// Canastas largas: a partir de este número de insumos aparece el buscador.
const MIN_PARA_BUSCAR = 8;

const coincide = (nombre, texto) => nombre.toLowerCase().includes(texto.trim().toLowerCase());

function renderEditar({
  cirugia, draft, onDraftChange, onRecibir,
}) {
  const ok = draft.ok ?? {};
  const recibidoDraft = draft.recibido ?? {};
  const ajustando = draft.ajustando ?? {};
  const busqueda = draft.busquedaInsumo ?? '';
  const todas = cirugia.canasta.items.map((item) => {
    const despachado = cantidadDespachada(item);
    const recibido = recibidoDraft[item.nombre] ?? despachado;
    const difFarmacia = despachado < item.cantidad;
    return {
      item,
      despachado,
      recibido,
      verificado: Boolean(ok[item.nombre]),
      novedad: novedadItem(item, recibido),
      difFarmacia,
      // Diferencia de cualquier origen: estas filas se verifican una a una.
      dif: difFarmacia || recibido < despachado,
      ajustable: Boolean(ajustando[item.nombre]) || recibido !== despachado,
    };
  });
  // Lo que viene corto de farmacia va primero (orden estable, no salta al ajustar).
  const filas = [...todas].sort((a, b) => Number(b.difFarmacia) - Number(a.difFarmacia));
  const visibles = busqueda.trim() ? filas.filter((f) => coincide(f.item.nombre, busqueda)) : filas;

  const verificados = filas.filter((f) => f.verificado).length;
  const todos = verificados === filas.length;
  const conNovedades = filas.some((f) => f.recibido < f.item.cantidad);
  const origen = origenDiferencia(filas.map((f) => ({ item: f.item, recibido: f.recibido })));
  const motivoObligatorio = origen === 'entrega' || origen === 'ambos';
  const motivo = draft.motivo ?? (origen === 'farmacia' ? 'faltante-farmacia' : undefined);
  const faltaMotivo = conNovedades && motivoObligatorio && !draft.motivo;
  const difSinVerificar = filas.filter((f) => f.dif && !f.verificado).length;
  // El panel de novedad solo aparece cuando hace falta (todo verificado, o un
  // faltante en la entrega que exige motivo): antes le quitaría altura a la tabla.
  const mostrarNovedad = conNovedades && (todos || motivoObligatorio);

  // "Verificar todos" solo cubre las filas sin diferencia; las demás se revisan a propósito.
  const seleccionables = filas.filter((f) => !f.dif);
  const todosSel = seleccionables.length > 0 && seleccionables.every((f) => f.verificado);
  const algunoSel = seleccionables.some((f) => f.verificado);
  const alternarSeleccionables = () => {
    const siguiente = { ...ok };
    seleccionables.forEach((f) => {
      if (todosSel) delete siguiente[f.item.nombre];
      else siguiente[f.item.nombre] = true;
    });
    onDraftChange({ ok: siguiente });
  };
  const alternar = (f) => onDraftChange({ ok: { ...ok, [f.item.nombre]: !f.verificado } });
  const clickFila = (e, f) => {
    if (e.target.closest('button')) return;
    alternar(f);
  };
  const activarAjuste = (f) => onDraftChange({ ajustando: { ...ajustando, [f.item.nombre]: true } });
  const ajustar = (f, delta) => onDraftChange({
    recibido: { ...recibidoDraft, [f.item.nombre]: Math.min(f.despachado, Math.max(0, f.recibido + delta)) },
  });
  const confirmar = () => onRecibir(
    Object.fromEntries(filas.map((f) => [f.item.nombre, f.recibido])),
    conNovedades ? { motivo, nota: draft.nota } : {},
  );

  let mensaje = 'Haz clic en cada insumo para verificarlo, o usa el check de la cabecera.';
  if (todos && faltaMotivo) mensaje = 'Indica el motivo de la diferencia para poder confirmar.';
  else if (difSinVerificar > 0) mensaje = 'Los insumos con diferencia se verifican uno a uno.';
  const ariaTodos = todosSel ? true : (algunoSel ? 'mixed' : false);

  return (
    <>
      <div className="cnc-tab-body">
        <ProgresoVerificacion verificados={verificados} total={filas.length} conDiferencia={difSinVerificar} />
        {filas.length > MIN_PARA_BUSCAR && (
          <InsumosBuscador value={busqueda} onChange={(v) => onDraftChange({ busquedaInsumo: v })} />
        )}
        <div className="cnc-tabla-scroll">
          <table className="cnc-tabla">
            <thead>
              <tr>
                <th className="cnc-col-ok">
                  <button
                    type="button"
                    className={`cnc-check cnc-check-head${todosSel ? ' on' : ''}${!todosSel && algunoSel ? ' mixto' : ''}`}
                    aria-pressed={ariaTodos}
                    aria-label="Verificar todos los insumos sin diferencias"
                    disabled={seleccionables.length === 0}
                    onClick={alternarSeleccionables}
                  >
                    <span className="cnc-check-box">
                      {todosSel && <LuCheck className="icon" aria-hidden="true" />}
                      {!todosSel && algunoSel && <LuMinus className="icon" aria-hidden="true" />}
                    </span>
                  </button>
                </th>
                <th>Insumo</th>
                <th className="cnc-num">Despachado</th>
                <th className="cnc-num">Recibido</th>
              </tr>
            </thead>
            <tbody>
              {visibles.length === 0 && (
                <tr><td colSpan={4} className="cnc-sin-resultados">Ningún insumo coincide con la búsqueda.</td></tr>
              )}
              {visibles.map((f) => (
                <tr
                  key={f.item.nombre}
                  className={['cnc-fila-click', f.difFarmacia && 'cnc-fila-dif', f.verificado && 'cnc-fila-ok'].filter(Boolean).join(' ')}
                  onClick={(e) => clickFila(e, f)}
                >
                  <td className="cnc-col-ok">
                    <button
                      type="button"
                      className={`cnc-check${f.verificado ? ' on' : ''}`}
                      aria-pressed={f.verificado}
                      aria-label={`Verificar ${f.item.nombre}`}
                      onClick={() => alternar(f)}
                    >
                      <span className="cnc-check-box">{f.verificado && <LuCheck className="icon" aria-hidden="true" />}</span>
                    </button>
                  </td>
                  <td>
                    <div className="cnc-insumo-nombre">{f.item.nombre}</div>
                    {f.novedad && (
                      <div className="cnc-nov cnc-nov-inline">
                        <LuTriangleAlert className="icon" aria-hidden="true" />{f.novedad}
                      </div>
                    )}
                  </td>
                  <td className="cnc-num">
                    <span className={f.difFarmacia ? 'cnc-num-alerta' : undefined}>{f.despachado}</span>
                    {f.difFarmacia && <span className="cnc-de">de {f.item.cantidad}</span>}
                  </td>
                  <td className="cnc-num">
                    {f.ajustable ? (
                      <div className="cnc-stepper">
                        <button
                          type="button"
                          aria-label={`Disminuir recibido de ${f.item.nombre}`}
                          disabled={f.recibido <= 0}
                          onClick={() => ajustar(f, -1)}
                        >
                          <LuMinus className="icon" aria-hidden="true" />
                        </button>
                        <span className="cnc-stepper-valor">{f.recibido}</span>
                        <button
                          type="button"
                          aria-label={`Aumentar recibido de ${f.item.nombre}`}
                          disabled={f.recibido >= f.despachado}
                          onClick={() => ajustar(f, 1)}
                        >
                          <LuPlus className="icon" aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <div className="cnc-recibido-fijo">
                        <span className="cnc-recibido-valor">{f.recibido}</span>
                        <button type="button" className="cnc-link" onClick={() => activarAjuste(f)}>
                          Ajustar<span className="cnc-sr"> cantidad recibida de {f.item.nombre}</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {mostrarNovedad && (
          <NovedadRecepcion origen={origen} motivo={motivo} nota={draft.nota} onChange={onDraftChange} />
        )}
      </div>
      <div className="cnc-tab-footer">
        <span className="cnc-footer-msg">{mensaje}</span>
        {!todos && <Button icon={LuPackageCheck} disabled>{`Confirmar recepción (${verificados}/${filas.length})`}</Button>}
        {todos && !conNovedades && <Button icon={LuPackageCheck} onClick={confirmar}>Confirmar recepción completa</Button>}
        {todos && conNovedades && (
          <Button variant="warning-outline" icon={LuTriangleAlert} disabled={faltaMotivo} onClick={confirmar}>
            Recibir con novedades
          </Button>
        )}
      </div>
    </>
  );
}

function renderPreparacion({ cirugia, onDespachar }) {
  const { preparados, total } = resumenCanasta(cirugia);
  return (
    <>
      <div className="cnc-tab-body">
        <div className="cnc-tabla-scroll">
          <table className="cnc-tabla">
            <thead>
              <tr>
                <th>Insumo · <span className="cnc-prep-progreso">Preparados {preparados} de {total}</span></th>
                <th className="cnc-num">Solicitado</th>
                <th className="cnc-col-estado">Estado</th>
              </tr>
            </thead>
            <tbody>
              {cirugia.canasta.items.map((item) => (
                <tr key={item.nombre}>
                  <td className="cnc-insumo-nombre">{item.nombre}</td>
                  <td className="cnc-num">{item.cantidad}</td>
                  <td className="cnc-col-estado">
                    <Badge tone={item.preparado ? 'success' : 'neutral'}>{item.preparado ? 'Preparado' : 'Pendiente'}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="cnc-tab-footer">
        <span className="cnc-footer-msg">Podrás verificar la canasta cuando farmacia la despache.</span>
        {onDespachar && (
          <Button variant="secondary" icon={LuTruck} onClick={onDespachar}>Simular despacho de farmacia (demo)</Button>
        )}
      </div>
    </>
  );
}

function renderLectura({ cirugia, draft, onDraftChange }) {
  const busqueda = draft.busquedaInsumo ?? '';
  const items = cirugia.canasta.items;
  const visibles = busqueda.trim() ? items.filter((i) => coincide(i.nombre, busqueda)) : items;
  const nota = cirugia.canasta.recepcion?.nota;
  return (
    <>
      <div className="cnc-tab-body">
        {items.length > MIN_PARA_BUSCAR && (
          <InsumosBuscador value={busqueda} onChange={(v) => onDraftChange({ busquedaInsumo: v })} />
        )}
        <div className="cnc-tabla-scroll">
          <table className="cnc-tabla">
            <thead>
              <tr>
                <th className="cnc-col-ico"><span className="cnc-sr">Estado</span></th>
                <th>Insumo</th>
                <th className="cnc-num">Despachado</th>
                <th className="cnc-num">Recibido</th>
              </tr>
            </thead>
            <tbody>
              {visibles.length === 0 && (
                <tr><td colSpan={4} className="cnc-sin-resultados">Ningún insumo coincide con la búsqueda.</td></tr>
              )}
              {visibles.map((item) => {
                const recibido = cantidadRecibida(item);
                const despachado = cantidadDespachada(item);
                const novedad = item.novedad
                  ?? (recibido < item.cantidad ? `Faltan ${item.cantidad - recibido} respecto a lo solicitado` : '');
                return (
                  <tr key={item.nombre}>
                    <td className="cnc-col-ico">
                      {novedad
                        ? <LuTriangleAlert className="cnc-ico cnc-ico-warn" aria-label="Con novedad" />
                        : <LuCheck className="cnc-ico cnc-ico-ok" aria-label="Sin novedad" />}
                    </td>
                    <td>
                      <div className="cnc-insumo-nombre">{item.nombre}</div>
                      {novedad && (
                        <div className="cnc-nov cnc-nov-inline">
                          <LuTriangleAlert className="icon" aria-hidden="true" />{novedad}
                        </div>
                      )}
                    </td>
                    <td className="cnc-num">
                      <span className={despachado < item.cantidad ? 'cnc-num-alerta' : undefined}>{despachado}</span>
                      {despachado < item.cantidad && <span className="cnc-de">de {item.cantidad}</span>}
                    </td>
                    <td className="cnc-num"><strong>{recibido}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {nota && <p className="cnc-nota-lectura"><strong>Nota de la recepción:</strong> {nota}</p>}
      </div>
      <div className="cnc-tab-footer">
        <span className="cnc-footer-msg">{lineaRecepcion(cirugia)}</span>
      </div>
    </>
  );
}

function renderVacio({ cirugia }) {
  // Canasta sin ítems: no hay nada que solicitar ni que recibir.
  if (cirugia.canasta.items.length === 0) {
    return (
      <>
        <div className="cnc-tab-body">
          <p className="cnc-vacio">Esta cirugía no tiene insumos en su canasta.</p>
        </div>
        <div className="cnc-tab-footer">
          <span className="cnc-footer-msg">Los insumos se agregan desde Programación.</span>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="cnc-tab-body">
        <p className="cnc-vacio">Esta canasta todavía no fue solicitada a farmacia.</p>
      </div>
      <div className="cnc-tab-footer">
        <span className="cnc-footer-msg">Los insumos se solicitan desde Programación; cuando farmacia los despache podrás recibirlos aquí.</span>
      </div>
    </>
  );
}

export default function RecepcionTab(props) {
  const { estado } = resumenCanasta(props.cirugia);
  if (estado === 'despachada') return renderEditar(props);
  if (estado === 'en-preparacion') return renderPreparacion(props);
  if (estado === 'sin-solicitar') return renderVacio(props);
  return renderLectura(props);
}
