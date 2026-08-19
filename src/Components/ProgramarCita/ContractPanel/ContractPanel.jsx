'use client';

import { useState } from 'react';
import './ContractPanel.css';
import { CONTRACT, fmtCOP, SERVICES } from '@/hooks/ProgramarCita/agendaMockData';
import { LuChevronDown, LuFileText, LuSearch } from 'react-icons/lu';

// Todo el panel (N° Contrato/Tipo, buscador y servicios contratados) arranca
// colapsado bajo un único header — son datos de consulta ocasional que antes
// ocupaban espacio de entrada en un sidebar ya apretado (mini calendario +
// este panel), mismo criterio que las secciones secundarias de
// DetalleCitaModal (ver shared.css, .chev).
export default function ContractPanel() {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className={`pc-panel pc-contract-panel${abierto ? '' : ' collapsed'}`}>
      <div className="pc-contract-top">
        <button
          type="button"
          className="pc-contract-toggle"
          aria-expanded={abierto}
          onClick={() => setAbierto((v) => !v)}
        >
          <span className="pc-contract-icon-label"><LuFileText className="icon" />Contrato</span>
          <LuChevronDown className={`chev${abierto ? ' open' : ''}`} aria-hidden="true" />
        </button>
        <button type="button" className="pc-link-btn" onClick={() => window.ncToast?.('Cambio de contrato en desarrollo.')}>Cambiar</button>
      </div>
      {abierto && (
        <>
          <div className="pc-contract-row">
            <span className="k">N° Contrato</span>
            <span className="v">{CONTRACT.numero}</span>
          </div>
          <div className="pc-contract-row">
            <span className="k">Tipo</span>
            <span className="v link">{CONTRACT.tipo}</span>
          </div>

          <div className="pc-contract-search">
            <LuSearch className="icon" />
            <input type="text" placeholder="Buscar procedimiento..." />
          </div>

          <div className="pc-contract-services-head">
            <span>Servicios contratados</span>
            <span className="pc-count-badge">{SERVICES.length}</span>
          </div>
          <div className="pc-service-list">
            {SERVICES.map((s) => (
              <div className="pc-service-item" key={s.codigo}>
                <div className="pc-service-info">
                  <div className="pc-service-name">{s.nombre}</div>
                  <div className="pc-service-code">{s.codigo}</div>
                </div>
                <span className="pc-service-price">{fmtCOP(s.valor)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
