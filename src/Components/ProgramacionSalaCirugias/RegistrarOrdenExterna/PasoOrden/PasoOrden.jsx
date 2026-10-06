import { useRef } from 'react';
import { LuEye, LuFileText, LuPaperclip, LuRefreshCw } from 'react-icons/lu';
import './PasoOrden.css';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import DatePicker from '@/Components/DatePicker/DatePicker';
import { DIAGNOSTICOS, INSTITUCIONES } from '@/hooks/ProgramacionSalaCirugias/gestion/catalogos';

const Obligatorio = () => <span className="gc-req" aria-hidden="true"> *</span>;

// Paso 2: datos de la orden externa. El documento adjunto es obligatorio y es
// el soporte del requisito "Orden médica" del checklist.
export default function PasoOrden({
  orden, onChange, hoy, onVerAdjunto,
}) {
  const archivoRef = useRef(null);

  function handleArchivo(e) {
    const archivo = e.target.files?.[0];
    if (archivo) onChange({ adjunto: archivo.name });
    e.target.value = '';
  }

  return (
    <div className="po-wrap gc-form">
      <div>
        <h2 className="gc-card-titulo">Orden externa</h2>
        <p className="gc-card-sub">Datos de la orden emitida por otra institución. Los campos con * son obligatorios.</p>
      </div>

      <div className="gc-grid-2">
        <div className="form-field">
          <label htmlFor="ro-institucion">Institución que remite<Obligatorio /></label>
          <FormSelect
            id="ro-institucion"
            value={orden.institucion}
            onChange={(institucion) => onChange({ institucion })}
            options={INSTITUCIONES}
            placeholder="Selecciona una institución"
          />
        </div>
        <div className="form-field">
          <label htmlFor="ro-medico">Médico que ordena<Obligatorio /></label>
          <input
            id="ro-medico"
            type="text"
            value={orden.medico}
            onChange={(e) => onChange({ medico: e.target.value })}
            placeholder="Nombre del médico"
            autoComplete="off"
          />
        </div>
        <div className="form-field">
          <label htmlFor="ro-fecha-orden">Fecha de la orden<Obligatorio /></label>
          <DatePicker
            id="ro-fecha-orden"
            value={orden.fecha}
            onChange={(fecha) => onChange({ fecha })}
            max={hoy}
            ariaLabel="Fecha de la orden"
            triggerClassName="po-fecha"
          />
        </div>
        <div className="form-field">
          <label htmlFor="ro-dx">Diagnóstico (CIE-10)<Obligatorio /></label>
          <FormSelect
            id="ro-dx"
            value={orden.dx}
            onChange={(dx) => onChange({ dx })}
            options={DIAGNOSTICOS}
            placeholder="Selecciona un diagnóstico"
          />
        </div>
      </div>

      <div className="po-adjunto">
        <span className="gc-label" id="ro-adjunto-label">Documento de la orden<Obligatorio /></span>
        <input
          ref={archivoRef}
          type="file"
          className="gc-sr"
          accept=".pdf,image/*"
          onChange={handleArchivo}
          aria-labelledby="ro-adjunto-label"
          tabIndex={-1}
        />
        {orden.adjunto ? (
          <div className="po-archivo">
            <LuFileText className="po-archivo-icono" aria-hidden="true" />
            <span className="po-archivo-nombre">{orden.adjunto}</span>
            <Button variant="secondary" size="sm" icon={LuEye} className="po-btn" onClick={onVerAdjunto}>Ver</Button>
            <Button variant="secondary" size="sm" icon={LuRefreshCw} className="po-btn" onClick={() => archivoRef.current?.click()}>
              Reemplazar
            </Button>
          </div>
        ) : (
          <div className="po-vacio">
            <p>Adjunta el PDF o una foto de la orden. Es el soporte del requisito “Orden médica”.</p>
            <Button variant="outline" icon={LuPaperclip} className="po-btn" onClick={() => archivoRef.current?.click()}>
              Adjuntar documento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
