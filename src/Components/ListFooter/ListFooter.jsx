import './ListFooter.css';
import { LuRefreshCw } from 'react-icons/lu';

// Footer de una card con listado: cuántos registros se ven de cuántos
// (búsqueda/filtro activos) y a qué hora se cargó la lista, con "Actualizar".
// Compartido por las tablas de pacientes de HC Hospitalización, Panel General
// de Enfermería y Enfermería → Pacientes. Además ocupa el fondo de la card, así
// la última fila nunca queda debajo del trigger flotante de Kora; por eso el
// contenido va alineado a la izquierda (el extremo derecho queda libre).
//
// - `actualizadoEn` (Date) y `onActualizar` los maneja la pantalla: con datos
//   mock "Actualizar" solo renueva la hora; con fetch, vuelve a pedir la lista.
// - `cargando`: mientras se pide la lista, el conteo cambia a "Cargando…"
//   (el número anterior ya no corresponde a lo que se va a mostrar).
export default function ListFooter({
  mostrando, total, sustantivo = 'pacientes', actualizadoEn, onActualizar, cargando = false,
}) {
  return (
    <footer className="list-footer">
      <span aria-live="polite">
        {cargando
          ? 'Cargando…'
          : <>Mostrando <b>{mostrando}</b> de <b>{total}</b> {sustantivo}</>}
      </span>
      <span className="list-footer-sep" aria-hidden="true">·</span>
      <span>
        Actualizado a las{' '}
        {/* suppressHydrationWarning: la hora del render del servidor y la
            del cliente pueden diferir por segundos/minuto. */}
        <time dateTime={actualizadoEn.toISOString()} suppressHydrationWarning>
          {actualizadoEn.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
        </time>
      </span>
      <button type="button" className="list-footer-refresh" onClick={onActualizar} disabled={cargando}>
        <LuRefreshCw className="icon" aria-hidden="true" />
        Actualizar
      </button>
    </footer>
  );
}
