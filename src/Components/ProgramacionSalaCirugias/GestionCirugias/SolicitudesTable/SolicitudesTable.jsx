import { LuChevronRight } from 'react-icons/lu';
import './SolicitudesTable.css';
import Button from '@/Components/Button/Button';
import EstadoChip from '../EstadoChip/EstadoChip';
import OrigenTag from '../OrigenTag/OrigenTag';
import ProgresoChequeo from '../ProgresoChequeo/ProgresoChequeo';
import {
  ESTADO_GENERAL_LABEL, ESTADO_ITEM_LABEL, ITEM_LABEL, TONO_GENERAL, TONO_ITEM,
  enmascararDocumento, evaluarSolicitud,
} from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';

const PASOS = ['orden', 'autorizacion', 'valoracion'];

// Mini-chip de la columna Estudios: "Lab"/"Img", y "opc." si el estudio es
// opcional (un opcional pendiente no bloquea la programación).
function EstudioChip({ clave, abreviatura, item }) {
  const opcional = !item.obligatorio && item.estado !== 'no-requerido';
  const lectura = `${ITEM_LABEL[clave]}: ${ESTADO_ITEM_LABEL[item.estado]}${opcional ? ' (opcional)' : ''}`;
  return (
    <EstadoChip tone={TONO_ITEM[item.estado]} mini srLabel={lectura}>
      {abreviatura}{opcional ? ' opc.' : ''}
    </EstadoChip>
  );
}

// Tabla de solicitudes. Cada fila es clicable con el mouse; para teclado y
// lectores de pantalla el control real es el botón "Revisar" de la última
// columna (un solo tab stop por fila).
export default function SolicitudesTable({
  solicitudes, selectedId, onSelect,
}) {
  return (
    <div className="sct-scroll">
      <table className="sct-table">
        <caption className="sct-sr">Solicitudes de cirugía y su lista de chequeo</caption>
        <thead>
          <tr>
            <th scope="col" className="sct-sticky">Paciente</th>
            <th scope="col">Procedimiento (CUPS)</th>
            <th scope="col" className="sct-origen">Origen</th>
            <th scope="col" className="sct-paso">Orden médica</th>
            <th scope="col" className="sct-paso">Autorización EPS</th>
            <th scope="col" className="sct-paso">Valoración preanestésica</th>
            <th scope="col" className="sct-paso">Estudios</th>
            <th scope="col">Estado del chequeo</th>
            <th scope="col"><span className="sct-sr">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((s) => {
            const ev = evaluarSolicitud(s);
            const seleccionada = s.id === selectedId;
            return (
              <tr
                key={s.id}
                className={seleccionada ? 'selected' : undefined}
                onClick={() => onSelect(s.id)}
              >
                <td className="sct-sticky">
                  <span className="sct-main">{s.paciente.nombre}</span>
                  <span className="sct-sub">
                    {enmascararDocumento(s.paciente.tipoDocumento, s.paciente.numeroDocumento)} · {s.paciente.edad} años
                  </span>
                  <span className="sct-sub">{s.eps}</span>
                </td>
                <td>
                  <span className="sct-main">{s.procedimiento}</span>
                  <span className="sct-sub">{s.cups} · {s.especialidad}</span>
                </td>
                <td className="sct-origen"><OrigenTag origen={s.origen} /></td>
                {PASOS.map((clave) => {
                  const item = s.checklist[clave];
                  return (
                    <td key={clave} className="sct-paso">
                      <EstadoChip tone={TONO_ITEM[item.estado]}>{ESTADO_ITEM_LABEL[item.estado]}</EstadoChip>
                    </td>
                  );
                })}
                <td className="sct-paso">
                  <div className="sct-estudios">
                    <EstudioChip clave="laboratorios" abreviatura="Lab" item={s.checklist.laboratorios} />
                    <EstudioChip clave="imagenes" abreviatura="Img" item={s.checklist.imagenes} />
                  </div>
                </td>
                <td>
                  <div className="sct-chequeo">
                    <EstadoChip tone={TONO_GENERAL[ev.estado]}>{ESTADO_GENERAL_LABEL[ev.estado]}</EstadoChip>
                    <ProgresoChequeo evaluacion={ev} />
                  </div>
                </td>
                <td className="sct-accion">
                  <Button
                    variant="outline"
                    size="sm"
                    className="sct-revisar"
                    icon={LuChevronRight}
                    aria-label={`Revisar solicitud de ${s.paciente.nombre}`}
                    aria-pressed={seleccionada}
                    onClick={(e) => { e.stopPropagation(); onSelect(s.id); }}
                  >
                    Revisar
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
