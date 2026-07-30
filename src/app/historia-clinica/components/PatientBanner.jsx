// Banner del paciente (identidad, alergias, datos de admisión). Puramente
// presentacional: legacy-app.js solo lee estos nodos por id/clase (p. ej. para
// abrir el popover de alergias o para copiar nombre/CC dentro de los modales),
// nunca los re-renderiza.
export default function PatientBanner() {
  return (
    <div className="patient-banner">
      <div className="patient-avatar">ID</div>
      <div className="patient-name-block"><div className="pname">Isabella Daniela Rodríguez Paternina</div></div>
      <div className="patient-meta">
        <div className="pm-item"><span className="lbl">CC</span> <b>1234567890</b></div>
        <div className="pm-item"><span className="lbl">EDAD</span> <b>34 años 10 meses 14 días</b></div>
        <div className="pm-item"><span className="lbl">SEXO</span> <b>Femenino</b></div>
        <div className="pm-item"><b>Salud Total Entidad Promotora de Salud del Régimen Contributivo y del Régimen S</b></div>
        <div className="pm-item"><a href="#">Ver más datos</a></div>
      </div>
      <div className="patient-banner-right">
        <div className="filter-popover-wrap" id="allergy-popover-wrap">
          <button type="button" className="allergy-chip" id="allergy-btn" aria-haspopup="true" aria-expanded="false" aria-controls="allergy-popover">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            Alergias
          </button>
          <div className="filter-popover filter-popover-right" id="allergy-popover" role="dialog" aria-label="Detalle de alergias del paciente">
            <div className="fp-title">Alergias registradas</div>
            <div className="dp-info" style={{marginBottom: '0'}}>
              <div className="dp-info-row"><span className="k">Penicilina</span><span className="v">Reacción cutánea moderada</span></div>
              <div className="dp-info-row"><span className="k">Mariscos</span><span className="v">Anafilaxia leve</span></div>
            </div>
          </div>
        </div>
      </div>
      <div className="admission-row">
        <div className="ar-item"><span className="lbl">Admisión</span> <b>0200265899</b></div>
        <div className="ar-item"><span className="lbl">N° contrato</span> <b>** No Especificado **</b></div>
        <div className="ar-item"><span className="lbl">ID Contrato</span> <b>197</b></div>
        <div className="ar-item"><span className="lbl">Cama</span> <b>305</b></div>
        <div className="ar-item"><span className="lbl">Estado</span> <span className="badge status-active badge-dot-inline"><span className="dot"></span>Activo</span></div>
      </div>
    </div>
  );
}
