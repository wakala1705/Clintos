'use client';

import { useEffect } from 'react';
import './PdfViewerModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { LuFileText } from 'react-icons/lu';

// Visor de PDF en un modal (<iframe> nativo): muestra un documento sin sacar
// al usuario de la pantalla. Usa las clases del modal de la feature donde se
// monta (.modal-overlay.open/.modal-card, definidas por feature); el tamaño y
// el iframe viven en PdfViewerModal.css.
//
//   <PdfViewerModal title="Orden médica" subtitle="Claudia ..." src="/mock/x.pdf" onClose={...} />
//
// Escape cierra solo el visor: el listener va en captura y corta la
// propagación para no cerrar también el modal de debajo (que escucha Escape en
// el mismo `document`).
export default function PdfViewerModal({
  src, title, subtitle, onClose, closeLabel = 'Cerrar visor',
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onClose();
    }
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  return (
    <div
      className="modal-overlay open"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-card pvm-card" role="dialog" aria-modal="true" aria-labelledby="pvm-title">
        <ModalHeader
          icon={LuFileText}
          tone="primary"
          title={title}
          titleId="pvm-title"
          subtitle={subtitle}
          onClose={onClose}
          closeLabel={closeLabel}
          autoFocusClose
        />

        <div className="pvm-body">
          <iframe className="pvm-frame" src={src} title={title} />
        </div>

        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}
