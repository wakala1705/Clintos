'use client';

import {
  LuInfo, LuMinus, LuPackageCheck, LuPlus,
} from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import InsumosBuscador from '../InsumosBuscador/InsumosBuscador';
import {
  CANASTA_ESTADOS_RECIBIDOS, cantidadRecibida, resumenCanasta,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { lineaConsumo, resumenDevolucion } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import { hojaRegistrada, precargaConsumoDesdeHoja } from '@/hooks/ProgramacionSalaCirugias/cierre/cierre';
import { obtenerHojaConsumo } from '@/hooks/ProgramacionSalaCirugias/hojaConsumo/hojaConsumo';
import './ConsumoTab.css';

// Pestaña "Consumo y devolución": por insumo, lo recibido, lo usado (editable
// hasta registrar) y lo que vuelve a farmacia (recibido − usado). Registrar
// crea la devolución (registrarConsumo -> guardarDevolucion), que también se ve
// en la ventana "Devoluciones en Cirugías" de Programación. Si la hoja de
// consumo de la cirugía ya está registrada, precarga lo usado por nombre de
// insumo (ver precargaConsumoDesdeHoja): el usuario lo confirma o corrige antes
// de registrar; lo que edite a mano manda sobre la precarga.
export default function ConsumoTab({
  cirugia, draft, onDraftChange, onRegistrarConsumo,
}) {
  const { estado } = resumenCanasta(cirugia);
  if (!CANASTA_ESTADOS_RECIBIDOS.includes(estado)) {
    return (
      <>
        <div className="cnc-tab-body">
          <p className="cnc-vacio">La canasta no fue recibida, no hay consumo que registrar.</p>
        </div>
        <div className="cnc-tab-footer" />
      </>
    );
  }

  const consumo = cirugia.canasta.consumo;
  const usadoDraft = draft.usado ?? {};
  const hoja = obtenerHojaConsumo(cirugia.id);
  const precarga = precargaConsumoDesdeHoja(cirugia, hoja);
  const usados = consumo ? consumo.usados : { ...precarga.usados, ...usadoDraft };
  const filas = cirugia.canasta.items.map((item) => {
    const recibido = cantidadRecibida(item);
    const usado = usados[item.nombre] ?? recibido;
    return {
      item, recibido, usado, devolver: recibido - usado,
    };
  });
  const { unidades, insumos } = resumenDevolucion(cirugia, Object.fromEntries(filas.map((f) => [f.item.nombre, f.usado])));

  const busqueda = draft.busquedaInsumo ?? '';
  const visibles = busqueda.trim()
    ? filas.filter((f) => f.item.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
    : filas;
  const ajustar = (f, delta) => onDraftChange({
    usado: { ...usadoDraft, [f.item.nombre]: Math.min(f.recibido, Math.max(0, f.usado + delta)) },
  });
  const registrar = () => onRegistrarConsumo(Object.fromEntries(filas.map((f) => [f.item.nombre, f.usado])));

  return (
    <>
      <div className="cnc-tab-body">
        {!consumo && (
          <p className="cnc-hoja-nota" role="status">
            <LuInfo className="icon" aria-hidden="true" />
            {!hojaRegistrada(hoja)
              ? 'La hoja de consumo aún no está registrada. Regístrala primero: precarga lo usado de esta canasta.'
              : precarga.coincidencias === 0
                ? 'La hoja de consumo usa otro listado de materiales: ningún insumo coincide. Revisa lo usado a mano.'
                : `Lo usado se precargó desde la hoja de consumo (${precarga.coincidencias} de ${precarga.total} insumos). Confírmalo o corrígelo.`}
          </p>
        )}
        {filas.length > 8 && (
          <InsumosBuscador value={busqueda} onChange={(v) => onDraftChange({ busquedaInsumo: v })} />
        )}
        <div className="cnc-tabla-scroll">
          <table className="cnc-tabla">
          <thead>
            <tr>
              <th>Insumo</th>
              <th className="cnc-num">Recibido</th>
              <th className="cnc-num">Usado</th>
              <th className="cnc-num">Devolver</th>
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 && (
              <tr><td colSpan={4} className="cnc-sin-resultados">Ningún insumo coincide con la búsqueda.</td></tr>
            )}
            {visibles.map((f) => (
              <tr key={f.item.nombre}>
                <td className="cnc-insumo-nombre">{f.item.nombre}</td>
                <td className="cnc-num">{f.recibido}</td>
                <td className="cnc-num">
                  {consumo ? (
                    <span className="cnc-usado-fijo">{f.usado}</span>
                  ) : (
                    <div className="cnc-stepper">
                      <button
                        type="button"
                        aria-label={`Disminuir usado de ${f.item.nombre}`}
                        disabled={f.usado <= 0}
                        onClick={() => ajustar(f, -1)}
                      >
                        <LuMinus className="icon" aria-hidden="true" />
                      </button>
                      <span className="cnc-stepper-valor">{f.usado}</span>
                      <button
                        type="button"
                        aria-label={`Aumentar usado de ${f.item.nombre}`}
                        disabled={f.usado >= f.recibido}
                        onClick={() => ajustar(f, 1)}
                      >
                        <LuPlus className="icon" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </td>
                <td className={`cnc-num ${f.devolver > 0 ? 'cnc-dev-uno' : 'cnc-dev-cero'}`}>{f.devolver}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
      <div className="cnc-tab-footer">
        {consumo ? (
          <span className="cnc-footer-msg">{lineaConsumo(cirugia)}</span>
        ) : (
          <>
            <span className="cnc-footer-msg">
              Devolución a farmacia: <strong>{unidades} unidades</strong> en {insumos} insumos
            </span>
            <Button icon={LuPackageCheck} onClick={registrar}>Registrar consumo y devolución</Button>
          </>
        )}
      </div>
    </>
  );
}
