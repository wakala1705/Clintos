import './BedCard.css';
import BedActionsMenu from '../BedActionsMenu/BedActionsMenu';
import InfoLine from '../InfoLine/InfoLine';
import {
  cardHue, categoriaPaciente, formatEdadEstancia, formatVentanaReserva, infoLimpieza,
} from '@/hooks/GestionCamas/bedContextFormat';
import {
  LuBaby, LuUser, LuCheck, LuSparkles, LuClock3, LuWrench, LuLock, LuBed,
} from 'react-icons/lu';
// Excepción documentada a "Lucide vía react-icons" (AGENTS.md "Icons") —
// react-icons@5.7.0 (última versión publicada) todavía no sincronizó los
// íconos mars/venus que sí existen en Lucide (lucide.dev/icons/mars,
// /venus): sin ellos en react-icons/lu, se agregó `lucide-react` (el
// paquete oficial) solo para estos 2, en vez de seguir con los glifos
// Unicode ♀/♂ (encargo explícito: "utilicemos el icono de lucide LuMars...
// y femenino LuVenus").
import { Mars, Venus } from 'lucide-react';

// Copy del label de estado (encargo explícito, rediseño 2 paneles v2 —
// "8 estados en 2 grupos") — deliberadamente NO reusa ESTADO_LABEL de
// mockCamasData.js: ese mapa es la fuente de verdad para el resto de la app
// (filtros, tabla, formularios) y el encargo pide un copy específico para
// la card ("Disponible", "En mantenimiento", "Fuera de servicio", "En
// limpieza") que no coincide 1:1 con esos labels (ni cambia `cama.estado`
// ni el estado interno "bloqueada" — ver cardHue, bedContextFormat.js). Los
// 3 casos de Ocupada comparten el mismo texto: el color del panel ya
// distingue población, repetirlo en el label sería redundante.
const ESTADO_LABEL_CARD = {
  libre: 'Disponible',
  ocupada: 'Ocupada',
  reservada: 'Reservada',
  limpieza: 'En limpieza',
  mantenimiento: 'En mantenimiento',
  bloqueada: 'Fuera de servicio',
};

// Ícono de estado (rediseño "tenue" — reemplaza el panel izquierdo sólido):
// Ocupada/Disponible comparten el check ("operación normal"); los demás
// estados llevan un ícono propio que señala por qué la cama necesita
// atención distinta (limpieza en curso, reserva a futuro, fuera de uso).
// `aislamiento`/`inactiva` (ESTADOS, mockCamasData.js) no tienen copy propio
// en esta tarjeta desde antes de este rediseño (ESTADO_LABEL_CARD tampoco
// los cubre, mismo criterio que cardHue cayendo a "unknown" para ellos,
// bedContextFormat.js) — LuBed como fallback evita romper el render de
// <IconoEstado> para cualquier estado fuera de esta tabla.
const ESTADO_ICONO_CARD = {
  libre: LuCheck,
  ocupada: LuCheck,
  reservada: LuClock3,
  limpieza: LuSparkles,
  mantenimiento: LuWrench,
  bloqueada: LuLock,
};

// Ícono de género (encargo explícito: "icono de género/sexo, SIEMPRE
// visible, independiente del color de fondo") — señal aparte de
// `categoriaPaciente` (que colorea el ícono de arriba y prioriza edad sobre
// género): acá se lee `genero` tal cual, así que un paciente pediátrico con
// género registrado igual muestra su ícono sobre el fondo naranja.
const GENERO_ICONO = { femenino: Venus, masculino: Mars };

// Progressive disclosure por estado (encargo explícito): en reposo, la
// tarjeta ya responde "¿qué cama es? ¿cuál es su estado? ¿qué está pasando?
// ¿qué puedo hacer ahora?" sin abrir nada — el bloque contextual (paciente/
// reserva/motivo/inicio de limpieza) es la única parte que cambia según
// `cama.estado`, el resto de la tarjeta (header, ubicación, tipo, menú) es
// el mismo esqueleto para los 6 estados.
function ContenidoPorEstado({ cama, etaTimestamp, now }) {
  if (cama.estado === 'ocupada' && cama.paciente) {
    // Indicador de población (encargo explícito) — naranja/LuBaby pediátrico
    // (edad < 18, prioridad sobre `genero`). Femenino/masculino ya no llevan
    // ícono de persona (encargo explícito: "eliminemos el icono del user...
    // de la card masculino y femenino") — el color del panel + el ícono de
    // género (ver GENERO_ICONO arriba) ya identifican esos 2 casos sin
    // necesidad del ícono de persona. Sin categoría (dato faltante) cae al
    // ícono neutro de antes.
    const categoria = categoriaPaciente(cama.paciente);
    const ocultarIcono = categoria === 'femenino' || categoria === 'masculino';
    const IconoPaciente = categoria === 'nino' ? LuBaby : LuUser;
    // Ícono de género — señal independiente de `categoria` (ver
    // GENERO_ICONO arriba): se lee de `genero` tal cual, así que un
    // pediátrico con género registrado también lo muestra. Sin dato, no se
    // renderiza nada (= "neutral", nunca un ícono inventado).
    const IconoGenero = GENERO_ICONO[cama.paciente.genero];
    return (
      <>
        <div className="cb-card-paciente">
          {!ocultarIcono && (
            <IconoPaciente
              className={`icon${categoria ? ` cb-card-paciente-icon-${categoria}` : ''}`}
              aria-hidden="true"
            />
          )}
          <div>
            <div className="cb-card-paciente-nombre">
              {cama.paciente.nombre}
              {IconoGenero && (
                <IconoGenero className="icon cb-card-gender-icon" role="img" aria-label={cama.paciente.genero} />
              )}
            </div>
          </div>
        </div>
        {/* Sin HC/ID acá (encargo explícito) — "Edad · días de estancia"
            (encargo previo) ya reemplazó a la línea de Ingreso que mostraba
            esta tarjeta antes; el HC queda solo en el detalle de la cama
            (BedDetailModal, misma clase .cb-card-paciente-hc pero JSX
            propio, ver bitácora — no se toca acá). */}
        <InfoLine label="Edad · estancia" value={formatEdadEstancia(cama.paciente)} />
      </>
    );
  }
  if (cama.estado === 'libre') {
    return (
      <>
        {/* Texto de situación (encargo: "comunicar claramente la condición
            operativa") — mismo rol que el nombre del paciente en Ocupada:
            lo primero que se lee después del header. Reutilizable tal cual
            para futuros sub-estados de Libre (Pendiente de limpieza, En
            preparación, ver .cb-card-status-text en BedCard.css) sin romper
            esta jerarquía. */}
        <div className="cb-card-status-text">Disponible para asignación</div>
        <InfoLine label="Última limpieza" value={cama.ultimaLimpieza ? `Hoy · ${cama.ultimaLimpieza}` : null} />
      </>
    );
  }
  if (cama.estado === 'reservada' && cama.reserva) {
    const ventana = formatVentanaReserva(cama.reserva.fechaInicio, cama.reserva.fechaVencimiento);
    const valor = ventana ? `${cama.reserva.motivo} · ${ventana}` : cama.reserva.motivo;
    return (
      <>
        {cama.reserva.paciente && <div className="cb-card-contexto">{cama.reserva.paciente}</div>}
        <InfoLine label="Reservada para" value={valor} />
        <InfoLine label="Última limpieza" value={cama.ultimaLimpieza ? `Hoy · ${cama.ultimaLimpieza}` : null} />
      </>
    );
  }
  if (cama.estado === 'limpieza') {
    const { label, valor } = infoLimpieza(cama, etaTimestamp, now);
    return <InfoLine label={label} value={valor} />;
  }
  if (cama.estado === 'mantenimiento') {
    return (
      <>
        {/* Copy corto (encargo explícito: "No disponible" para estados sin
            paciente) — mismo rol que .cb-card-status-text de Libre; a
            Mantenimiento/Bloqueada les faltaba una 1ra línea legible antes
            de la metadata (a diferencia de Reservada/Limpieza, que ya
            tenían "para quién"/"en progreso" como encabezado natural). */}
        <div className="cb-card-status-text">No disponible</div>
        <InfoLine label="Mantenimiento" value={cama.mantenimientoTipo} />
      </>
    );
  }
  if (cama.estado === 'bloqueada') {
    return (
      <>
        <div className="cb-card-status-text">No disponible</div>
        <InfoLine label="Motivo" value={cama.motivo} />
      </>
    );
  }
  return null;
}

// Metadata secundaria del panel derecho (encargo explícito: "tipo de
// habitación") — `cama.tipo` es el código crudo TIPO de CWEB.HABCAMA (01-11,
// ver TIPOS en mockCamasData.js), sin traducción inventada, mismo formato
// literal "Tipo NN" que ya usa BedDetailModal.jsx. Ausente en las camas del
// mock de GestionEnfermeria (BedBoardModal reusa BedCard con un objeto cama
// más simple) — InfoLine ya omite la fila cuando el valor es null.
function BloqueContextual(props) {
  return (
    <>
      <ContenidoPorEstado {...props} />
      <InfoLine label="Tipo" value={props.cama.tipo ? `Tipo ${props.cama.tipo}` : null} />
    </>
  );
}

// `onOpenDetail` es opcional (encargo: "al accionar la card, abrir el
// detalle de la cama") — sin él la tarjeta se comporta exactamente igual
// que antes (Gestión de Camas sigue abriendo su BedDetailModal solo desde
// "Ver detalle" en el ⋯, sin tocar ese flujo). Con él, la tarjeta completa
// se vuelve clickeable/enfocable; el menú "⋯" corta la propagación del
// click para que abrirlo no le "robe" el gesto a la tarjeta.
//
// Sin CTA permanente (encargo explícito, sección "Ajuste de cards — Bed
// Board"): el Bed Board es una vista de estado, no una grilla de acciones —
// "Trasladar"/"Asignar paciente"/etc ya no se muestran como botón fijo del
// footer para ningún estado (los 6 comparten este mismo esqueleto). Esas
// acciones siguen existiendo, pero solo dentro del menú "⋯" (MENU_ACCIONES,
// mockCamasData.js) o del flujo correspondiente — nunca repetidas en cada
// tarjeta.
//
// Rediseño "tenue" (encargo explícito): sin panel sólido — toda la tarjeta
// lleva el tinte suave del hue (`cardHue`, ver bedContextFormat.js) como
// fondo único. Fila superior: ícono de estado (ESTADO_ICONO_CARD) + número
// de cama + menú "⋯"; debajo, el label de estado y el bloque contextual de
// siempre. El label de estado NO reusa <EstadoCamaBadge> acá: ese componente
// colorea por `estado` solamente (ESTADO_COLOR, mockCamasData.js) y sigue
// así para sus otros consumidores (tabla, detalle, auditoría) — la tarjeta
// necesita el color de POBLACIÓN para Ocupada, así que pinta su propio label
// con `cardHue`, sin tocar el componente compartido.
export default function BedCard({
  cama, onAction, etaTimestamp, now, onOpenDetail,
}) {
  function handleKeyDown(e) {
    if (!onOpenDetail) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenDetail(cama.id);
    }
  }

  const hue = cardHue(cama);
  const IconoEstado = ESTADO_ICONO_CARD[cama.estado] || LuBed;

  return (
    <div
      className={`cb-card cb-card-${cama.estado} cb-card-hue-${hue}${onOpenDetail ? ' cb-card-clickable' : ''}`}
      role={onOpenDetail ? 'button' : undefined}
      tabIndex={onOpenDetail ? 0 : undefined}
      onClick={onOpenDetail ? () => onOpenDetail(cama.id) : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className="cb-card-top">
        <IconoEstado className="icon cb-card-estado-icon" aria-hidden="true" />
        <span className="cb-card-numero">{cama.numero}</span>
        <div className="cb-card-menu-wrap" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
          <BedActionsMenu estado={cama.estado} numero={cama.numero} onAction={(action) => onAction(action, cama.id)} />
        </div>
      </div>

      <div className="cb-card-body">
        <span className="cb-card-estado-label">{ESTADO_LABEL_CARD[cama.estado]}</span>
        <BloqueContextual cama={cama} etaTimestamp={etaTimestamp} now={now} />
      </div>
    </div>
  );
}
