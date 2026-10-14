'use client';

import { Fragment, useState } from 'react';
import {
  LuCirclePlus, LuCopy, LuTrash2, LuTriangleAlert,
} from 'react-icons/lu';
import './DiaHorario.css';
import Badge from '@/Components/Badge/Badge';
import FormSelect from '@/Components/FormSelect/FormSelect';
import ToggleSwitch from '@/Components/ToggleSwitch/ToggleSwitch';
import CopiarADias from '../CopiarADias/CopiarADias';
import {
  DIAS_SEMANA, DIAS_SEMANA_CORTO, FIN_JORNADA, INICIO_JORNADA, opcionesHora,
} from '@/hooks/AgendaCirujanos/horario';

// Hora de inicio hasta 18:30 y de fin desde 07:30: el bloque mínimo es de 30 min
// y nada sale de la jornada operativa.
const OPCIONES_INICIO = opcionesHora(INICIO_JORNADA, FIN_JORNADA - 30);
const OPCIONES_FIN = opcionesHora(INICIO_JORNADA + 30, FIN_JORNADA);

// Un día de la semana en una sola fila: día · rango de horario · acciones (interruptor,
// agregar bloque, copiar a otros días, quitar bloque). Cada bloque extra baja a una línea
// nueva. Presentacional: todo cambio sube por callbacks; solo recuerda si el panel de copia está abierto.
export default function DiaHorario({
  indice, dia, error, onToggle, onBloque, onAgregarBloque, onQuitarBloque, onCopiar,
}) {
  const [copiando, setCopiando] = useState(false);
  const nombre = DIAS_SEMANA[indice];

  return (
    <div className={`ac-dia${dia.activo ? '' : ' off'}`}>
      {/* Rejilla: una línea por bloque. Solo la primera lleva el interruptor y las acciones del día. */}
      <div className="ac-dia-fila">
        {(dia.activo ? dia.bloques : [null]).map((bloque, j) => (
          <Fragment key={j}>
            {j === 0
              ? <span className="ac-dia-nombre" title={nombre}>{DIAS_SEMANA_CORTO[indice]}</span>
              : <span aria-hidden="true" />}

            {bloque ? (
              <div className="ac-bloque">
                <div className="ac-hora">
                  <FormSelect
                    id={`ac-inicio-${indice}-${j}`}
                    ariaLabel={`Inicio del bloque ${j + 1}, ${nombre}`}
                    value={bloque.inicio}
                    onChange={(v) => onBloque(j, 'inicio', v)}
                    options={OPCIONES_INICIO}
                  />
                </div>
                <span className="ac-bloque-sep">a</span>
                <div className="ac-hora">
                  <FormSelect
                    id={`ac-fin-${indice}-${j}`}
                    ariaLabel={`Fin del bloque ${j + 1}, ${nombre}`}
                    value={bloque.fin}
                    onChange={(v) => onBloque(j, 'fin', v)}
                    options={OPCIONES_FIN}
                  />
                </div>
              </div>
            ) : (
              <span className="ac-dia-libre"><Badge tone="neutral">No disponible</Badge></span>
            )}

            {j === 0 ? (
              <ToggleSwitch
                label={nombre}
                ocultarEtiqueta
                checked={dia.activo}
                onChange={(activo) => {
                  onToggle(activo);
                  if (!activo) setCopiando(false);
                }}
              />
            ) : (
              <span aria-hidden="true" />
            )}

            {j === 0 && dia.activo ? (
              <button
                type="button"
                className="ncw-icon-btn ncw-icon-btn-primary"
                aria-label={`Agregar bloque, ${nombre}`}
                title="Agregar bloque"
                onClick={onAgregarBloque}
              >
                <LuCirclePlus className="icon" aria-hidden="true" />
              </button>
            ) : (
              <span aria-hidden="true" />
            )}

            {j === 0 && dia.activo ? (
              <button
                type="button"
                className="ncw-icon-btn ncw-icon-btn-primary"
                aria-label={`Copiar el horario del ${nombre.toLowerCase()} a otros días`}
                title="Copiar a otros días"
                aria-expanded={copiando}
                onClick={() => setCopiando((abierto) => !abierto)}
              >
                <LuCopy className="icon" aria-hidden="true" />
              </button>
            ) : (
              <span aria-hidden="true" />
            )}

            {/* Con un solo bloque no hay papelera: para quitar el horario se apaga el día. */}
            {bloque && dia.bloques.length > 1 ? (
              <button
                type="button"
                className="ncw-icon-btn ncw-icon-btn-danger"
                aria-label={`Quitar bloque ${j + 1}, ${nombre}`}
                title="Quitar bloque"
                onClick={() => onQuitarBloque(j)}
              >
                <LuTrash2 className="icon" aria-hidden="true" />
              </button>
            ) : (
              <span aria-hidden="true" />
            )}
          </Fragment>
        ))}
      </div>

      {dia.activo && copiando && (
        <CopiarADias
          origen={indice}
          onAplicar={(destinos) => { onCopiar(destinos); setCopiando(false); }}
          onCancelar={() => setCopiando(false)}
        />
      )}

      {error && (
        <p className="ac-err" role="alert">
          <LuTriangleAlert className="icon" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
