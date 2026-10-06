import { LuSearch, LuInfo, LuUserPlus } from 'react-icons/lu';
import './PasoPaciente.css';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { TIPOS_DOCUMENTO } from '@/hooks/ProgramacionSalaCirugias/gestion/catalogos';

// Paso 1: búsqueda por tipo y número de documento. `resultados` es null antes
// de buscar, [] si no hubo coincidencias. Al elegir la tarjeta se precarga la
// entidad pagadora (se informa con un aviso status-info).
export default function PasoPaciente({
  tipoDoc, onTipoDoc, numDoc, onNumDoc, resultados, onBuscar, paciente, onSeleccionar, onRegistrarPaciente,
}) {
  return (
    <div className="pp-wrap gc-form">
      <div>
        <h2 className="gc-card-titulo">Paciente</h2>
        <p className="gc-card-sub">Busca al paciente por tipo y número de documento.</p>
      </div>

      <form
        className="pp-busqueda"
        onSubmit={(e) => { e.preventDefault(); onBuscar(); }}
      >
        <div className="form-field pp-tipo">
          <label htmlFor="ro-tipo-doc">Tipo de documento</label>
          <FormSelect id="ro-tipo-doc" value={tipoDoc} onChange={onTipoDoc} options={TIPOS_DOCUMENTO} />
        </div>
        <div className="form-field pp-numero">
          <label htmlFor="ro-num-doc">Número de documento</label>
          <input
            id="ro-num-doc"
            type="text"
            inputMode="numeric"
            value={numDoc}
            onChange={(e) => onNumDoc(e.target.value)}
            placeholder="Ej. 79812604"
            autoComplete="off"
          />
        </div>
        <Button type="submit" icon={LuSearch} className="pp-buscar">Buscar</Button>
      </form>

      {resultados !== null && resultados.length === 0 && (
        <p className="pp-vacio" role="status">No encontramos un paciente con ese documento.</p>
      )}

      {resultados !== null && resultados.length > 0 && (
        <fieldset className="pp-resultados">
          <legend className="gc-label">Resultado de la búsqueda</legend>
          {resultados.map((p) => {
            const elegido = paciente?.numeroDocumento === p.numeroDocumento;
            return (
              <label key={p.numeroDocumento} className={`pp-card${elegido ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name="ro-paciente"
                  className="pp-radio"
                  checked={elegido}
                  onChange={() => onSeleccionar(p)}
                />
                <span className="pp-card-cuerpo">
                  <span className="pp-nombre">{p.nombre}</span>
                  <span className="pp-meta">{p.tipoDocumento} {p.numeroDocumento} · {p.edad} años · {p.sexo}</span>
                  <span className="pp-meta">{p.eps} · {p.regimen}</span>
                </span>
              </label>
            );
          })}
        </fieldset>
      )}

      {paciente && (
        <p className="gc-aviso" role="status">
          <LuInfo className="icon" aria-hidden="true" />
          <span>
            Entidad precargada desde la afiliación: <strong>{paciente.eps}</strong> · {paciente.regimen} · Contrato {paciente.contrato}.{' '}
            {paciente.ordenesActivas > 0
              ? `El paciente tiene ${paciente.ordenesActivas} orden${paciente.ordenesActivas > 1 ? 'es' : ''} activa${paciente.ordenesActivas > 1 ? 's' : ''}.`
              : 'No tiene otras órdenes activas.'}
          </span>
        </p>
      )}

      <button type="button" className="gc-link pp-registrar" onClick={onRegistrarPaciente}>
        <LuUserPlus className="icon" aria-hidden="true" />
        ¿El paciente no aparece? Registrar paciente
      </button>
    </div>
  );
}
