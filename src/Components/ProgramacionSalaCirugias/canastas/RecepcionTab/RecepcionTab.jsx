'use client';

import {
  LuCheck, LuMinus, LuPackageCheck, LuPlus, LuTriangleAlert, LuTruck,
} from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import {
  cantidadDespachada, cantidadRecibida, novedadItem, resumenCanasta,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { lineaRecepcion } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import './RecepcionTab.css';

// Pestaña "Recepción" del detalle. Un solo componente con 4 modos según el
// estado derivado de la canasta:
//  - despachada     -> editar: verificar cada insumo y ajustar lo recibido.
//  - en-preparacion -> vista de avance de farmacia.
//  - sin-solicitar  -> aviso vacío.
//  - resto          -> lectura de lo recibido.
// `draft` (borrador por cirugía) lo guarda el orquestador para no perderlo al
// cambiar de cirugía; solo se persiste al confirmar (onRecibir).
function renderEditar({
  cirugia, draft, onDraftChange, onRecibir,
}) {
  const ok = draft.ok ?? {};
  const recibidoDraft = draft.recibido ?? {};
  const filas = cirugia.canasta.items.map((item) => {
    const despachado = cantidadDespachada(item);
    const recibido = recibidoDraft[item.nombre] ?? despachado;
    return {
      item, despachado, recibido, verificado: Boolean(ok[item.nombre]), novedad: novedadItem(item, recibido),
    };
  });
  const verificados = filas.filter((f) => f.verificado).length;
  const todos = verificados === filas.length;
  const conNovedades = filas.some((f) => f.recibido < f.item.cantidad);

  const alternarTodos = () => onDraftChange({
    ok: todos ? {} : Object.fromEntries(filas.map((f) => [f.item.nombre, true])),
  });
  const alternar = (f) => onDraftChange({ ok: { ...ok, [f.item.nombre]: !f.verificado } });
  const ajustar = (f, delta) => onDraftChange({
    recibido: { ...recibidoDraft, [f.item.nombre]: Math.min(f.despachado, Math.max(0, f.recibido + delta)) },
  });
  const confirmar = () => onRecibir(Object.fromEntries(filas.map((f) => [f.item.nombre, f.recibido])));

  return (
    <>
      <div className="cnc-tab-body">
        <table className="cnc-tabla">
          <thead>
            <tr>
              <th className="cnc-col-ok">OK</th>
              <th>Insumo</th>
              <th className="cnc-num">Solicitado</th>
              <th className="cnc-num">Despachado</th>
              <th className="cnc-num">Recibido</th>
              <th className="cnc-col-nov">Novedad</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.item.nombre} className={f.verificado ? 'cnc-fila-ok' : undefined}>
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
                  {f.novedad && <div className="cnc-nov cnc-nov-inline">{f.novedad}</div>}
                </td>
                <td className="cnc-num">{f.item.cantidad}</td>
                <td className={`cnc-num${f.despachado < f.item.cantidad ? ' cnc-num-alerta' : ''}`}>{f.despachado}</td>
                <td className="cnc-num">
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
                </td>
                <td className="cnc-col-nov">{f.novedad
                  ? <span className="cnc-nov"><LuTriangleAlert className="icon" aria-hidden="true" />{f.novedad}</span>
                  : <span className="cnc-nov-nada" aria-label="Sin novedad">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="cnc-tab-footer">
        <span className="cnc-footer-msg"><strong>{verificados} de {filas.length}</strong> insumos verificados</span>
        <Button variant="secondary" onClick={alternarTodos}>{todos ? 'Desmarcar todos' : 'Marcar todos'}</Button>
        {!todos && <Button icon={LuPackageCheck} disabled>Confirmar recepción</Button>}
        {todos && !conNovedades && <Button icon={LuPackageCheck} onClick={confirmar}>Confirmar recepción completa</Button>}
        {todos && conNovedades && <Button variant="warning-outline" icon={LuTriangleAlert} onClick={confirmar}>Recibir con novedades</Button>}
      </div>
    </>
  );
}

function renderPreparacion({ cirugia, onDespachar }) {
  const { preparados, total } = resumenCanasta(cirugia);
  return (
    <>
      <div className="cnc-tab-body">
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
      <div className="cnc-tab-footer">
        <span className="cnc-footer-msg">Podrás verificar la canasta cuando farmacia la despache.</span>
        {onDespachar && (
          <Button variant="secondary" icon={LuTruck} onClick={onDespachar}>Simular despacho de farmacia (demo)</Button>
        )}
      </div>
    </>
  );
}

function renderLectura({ cirugia }) {
  return (
    <>
      <div className="cnc-tab-body">
        <table className="cnc-tabla">
          <thead>
            <tr>
              <th className="cnc-col-ico"><span className="cnc-sr">Estado</span></th>
              <th>Insumo</th>
              <th className="cnc-num">Solicitado</th>
              <th className="cnc-num">Despachado</th>
              <th className="cnc-num">Recibido</th>
              <th className="cnc-col-nov">Novedad</th>
            </tr>
          </thead>
          <tbody>
            {cirugia.canasta.items.map((item) => {
              const recibido = cantidadRecibida(item);
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
                    {novedad && <div className="cnc-nov cnc-nov-inline">{novedad}</div>}
                  </td>
                  <td className="cnc-num">{item.cantidad}</td>
                  <td className="cnc-num">{cantidadDespachada(item)}</td>
                  <td className="cnc-num"><strong>{recibido}</strong></td>
                  <td className="cnc-col-nov">{novedad
                    ? <span className="cnc-nov">{novedad}</span>
                    : <span className="cnc-nov-nada" aria-label="Sin novedad">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
