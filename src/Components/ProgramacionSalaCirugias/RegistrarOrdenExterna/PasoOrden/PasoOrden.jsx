import { useRef, useState } from 'react';
import {
  LuEye, LuFileText, LuPaperclip, LuRefreshCw, LuShieldCheck, LuTrash2,
} from 'react-icons/lu';
import './PasoOrden.css';
import Button from '@/Components/Button/Button';
import CatalogPickerTrigger from '../../CatalogPickerTrigger/CatalogPickerTrigger';
import CatalogoInstitucionesModal from '../CatalogoInstitucionesModal/CatalogoInstitucionesModal';
import CatalogoDiagnosticosModal from '@/Components/CatalogoDiagnosticosModal/CatalogoDiagnosticosModal';
import DatePicker from '@/Components/DatePicker/DatePicker';
import RegistrarAutorizacionModal from '../../GestionCirugias/RegistrarAutorizacionModal/RegistrarAutorizacionModal';
import { INSTITUCIONES } from '@/hooks/ProgramacionSalaCirugias/gestion/catalogos';

const Obligatorio = () => <span className="gc-req" aria-hidden="true"> *</span>;

// Paso 2: datos de la orden externa. El documento adjunto es opcional (si falta,
// "Orden médica" queda pendiente en el checklist). La autorización de la EPS es
// obligatoria: se registra con el mismo modal de Gestión de cirugías
// (RegistrarAutorizacionModal) y deja el requisito "Autorización" al día.
export default function PasoOrden({
  orden, onChange, hoy, onVerAdjunto, onVerAutorizacion, paciente, usuario,
}) {
  const archivoRef = useRef(null);
  const [catalogoAbierto, setCatalogoAbierto] = useState(null); // 'institucion' | 'dx' | 'autorizacion' | null

  function handleArchivo(e) {
    const archivo = e.target.files?.[0];
    if (archivo) {
      if (orden.adjuntoUrl) URL.revokeObjectURL(orden.adjuntoUrl);
      onChange({ adjunto: archivo.name, adjuntoUrl: URL.createObjectURL(archivo) });
    }
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
          <CatalogPickerTrigger
            id="ro-institucion"
            label={INSTITUCIONES.find((i) => i.value === orden.institucion)?.label}
            placeholder="Selecciona una institución"
            open={catalogoAbierto === 'institucion'}
            onClick={() => setCatalogoAbierto('institucion')}
            ariaLabel="Institución que remite"
            required
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
          <CatalogPickerTrigger
            id="ro-dx"
            label={orden.dx || undefined}
            placeholder="Selecciona un diagnóstico"
            open={catalogoAbierto === 'dx'}
            onClick={() => setCatalogoAbierto('dx')}
            ariaLabel="Diagnóstico (CIE-10)"
            required
          />
        </div>
      </div>

      <div className="po-adjunto">
        <span className="gc-label" id="ro-adjunto-label">Documento de la orden <span className="po-opcional">(opcional)</span></span>
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
            <p>Adjunta el PDF o una foto de la orden. Si no la adjuntas ahora, “Orden médica” quedará pendiente en la lista de chequeo.</p>
            <Button variant="outline" icon={LuPaperclip} className="po-btn" onClick={() => archivoRef.current?.click()}>
              Adjuntar documento
            </Button>
          </div>
        )}
      </div>

      <div className="po-adjunto">
        <span className="gc-label">Autorización de la EPS<Obligatorio /></span>
        {orden.autorizacion ? (
          <div className="po-archivo">
            <LuShieldCheck className="po-archivo-icono" aria-hidden="true" />
            <span className="po-archivo-nombre">
              Autorización N° {orden.autorizacion.numero}
              {orden.autorizacion.archivo && <span className="po-archivo-sub"> · {orden.autorizacion.archivo.nombre}</span>}
            </span>
            {orden.autorizacion.archivo?.url && (
              <Button variant="secondary" size="sm" icon={LuEye} className="po-btn" onClick={onVerAutorizacion}>Ver</Button>
            )}
            <Button variant="secondary" size="sm" icon={LuRefreshCw} className="po-btn" onClick={() => setCatalogoAbierto('autorizacion')}>
              Reemplazar
            </Button>
            <Button variant="secondary" size="sm" icon={LuTrash2} className="po-btn" onClick={() => onChange({ autorizacion: null })}>
              Quitar
            </Button>
          </div>
        ) : (
          <div className="po-vacio">
            <p>Registra el N° de autorización que emitió {paciente?.eps ?? 'la EPS'} y, si lo tienes, su soporte.</p>
            <Button variant="outline" icon={LuShieldCheck} className="po-btn" onClick={() => setCatalogoAbierto('autorizacion')}>
              Registrar autorización
            </Button>
          </div>
        )}
      </div>

      {catalogoAbierto === 'autorizacion' && (
        <RegistrarAutorizacionModal
          solicitud={{ paciente, eps: paciente?.eps }}
          usuario={usuario}
          onClose={() => setCatalogoAbierto(null)}
          onRegistrar={(autorizacion) => { onChange({ autorizacion }); setCatalogoAbierto(null); }}
        />
      )}
      {catalogoAbierto === 'institucion' && (
        <CatalogoInstitucionesModal
          instituciones={INSTITUCIONES}
          value={orden.institucion}
          onSelect={(institucion) => onChange({ institucion })}
          onClose={() => setCatalogoAbierto(null)}
        />
      )}
      {catalogoAbierto === 'dx' && (
        <CatalogoDiagnosticosModal
          onSelect={(dx) => onChange({ dx })}
          onClose={() => setCatalogoAbierto(null)}
        />
      )}
    </div>
  );
}
