import './ContractPanel.css';
import { CONTRACT, fmtCOP, SERVICES } from '@/hooks/ProgramarCita/agendaMockData';
import { LuFileText, LuSearch } from 'react-icons/lu';

export default function ContractPanel() {
  return (
    <div className="pc-panel pc-contract-panel">
      <div className="pc-contract-top">
        <div className="pc-contract-icon-label"><LuFileText className="icon" />Contrato</div>
        <button type="button" className="pc-link-btn">Cambiar</button>
      </div>
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
    </div>
  );
}
