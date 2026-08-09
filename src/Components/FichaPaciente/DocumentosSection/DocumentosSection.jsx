import './DocumentosSection.css';
import { LuFileCheck2, LuFileX2 } from 'react-icons/lu';

// Alcance solo administrativo (documento de identidad, consentimiento
// informado, autorizaciones de EPS) — los documentos clínicos (órdenes,
// resultados, epicrisis) viven en Historia Clínica, no se duplican aquí.
export default function DocumentosSection({ documentos }) {
  return (
    <div className="fp-docs-grid">
      {documentos.map((doc) => (
        <div className={`fp-doc-item ${doc.estado}`} key={doc.id}>
          {doc.estado === 'cargado' ? (
            <LuFileCheck2 className="icon fp-doc-icon" />
          ) : (
            <LuFileX2 className="icon fp-doc-icon" />
          )}
          <div className="fp-doc-info">
            <div className="fp-doc-tipo">{doc.tipo}</div>
            {doc.estado === 'cargado' ? (
              <div className="fp-doc-meta">{doc.nombreArchivo} · {doc.fecha}</div>
            ) : (
              <div className="fp-doc-meta fp-doc-pendiente">Pendiente de cargar</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
