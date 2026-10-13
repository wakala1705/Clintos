'use client';

import { useEffect, useRef, useState } from 'react';
import {
  LuFileText, LuPaperclip, LuRefreshCw, LuShieldCheck, LuTrash2,
} from 'react-icons/lu';
import './RegistrarAutorizacionModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { enmascararDocumento } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import { formatoFechaHora, validarAutorizacion } from '@/hooks/ProgramacionSalaCirugias/gestion/autorizacion';

// Modal de "Registrar autorización" del paso Autorización del chequeo
// (Gestión de cirugías): N° que emitió la EPS + documento de soporte opcional,
// elegido del equipo. Al registrar, el N° y el usuario que lo registró
// (`usuario`) quedan en el chequeo y se precargan en el paso 1 del wizard.
// Solo se guarda una URL temporal si el soporte es un PDF (para "Ver
// autorización"); es un prototipo, el archivo no se sube a ningún lado.
export default function RegistrarAutorizacionModal({
  solicitud, usuario, onClose, onRegistrar,
}) {
  const modalRef = useRef(null);
  const archivoRef = useRef(null);
  useModalFocusTrap(modalRef);

  const { paciente } = solicitud;
  const [numero, setNumero] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [intento, setIntento] = useState(false);
  const errores = validarAutorizacion({ numero });

  // Escape cierra (el foco queda atrapado en el modal por useModalFocusTrap).
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleArchivo(e) {
    const f = e.target.files?.[0];
    if (f) {
      if (archivo?.url) URL.revokeObjectURL(archivo.url);
      setArchivo({ nombre: f.name, url: f.type === 'application/pdf' ? URL.createObjectURL(f) : undefined });
    }
    e.target.value = '';
  }

  function quitarArchivo() {
    if (archivo?.url) URL.revokeObjectURL(archivo.url);
    setArchivo(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setIntento(true);
    if (Object.keys(errores).length > 0) return;
    onRegistrar({
      numero, archivo, registradoPor: usuario, fechaRegistro: formatoFechaHora(new Date()),
    });
  }

  const mostrarError = intento && errores.numero;

  return (
    <div className="modal-overlay open">
      <div
        ref={modalRef}
        className="modal-card ram-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ram-title"
      >
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuShieldCheck}
            tone="primary"
            title="Registrar autorización"
            titleId="ram-title"
            subtitle={`${paciente.nombre} · ${enmascararDocumento(paciente.tipoDocumento, paciente.numeroDocumento)}`}
            onClose={onClose}
            closeLabel="Cerrar registro de autorización"
            autoFocusClose={false}
          />

          <div className="modal-body ram-body">
            <p className="ram-help">Registra el N° de autorización que emitió {solicitud.eps} y adjunta su soporte.</p>

            <div className="form-field">
              <label htmlFor="ram-numero">N° de autorización *</label>
              <input
                id="ram-numero"
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Ej. AUT-2026-00456"
                autoComplete="off"
                autoFocus
                required
                aria-invalid={Boolean(mostrarError)}
                aria-describedby={mostrarError ? 'ram-numero-error' : undefined}
              />
              {mostrarError && <span className="ram-error" id="ram-numero-error">{errores.numero}</span>}
            </div>

            <div className="ram-adjunto">
              <span className="ram-label" id="ram-adjunto-label">Documento de autorización</span>
              <input
                ref={archivoRef}
                type="file"
                className="ram-sr"
                accept=".pdf,image/*"
                onChange={handleArchivo}
                aria-labelledby="ram-adjunto-label"
                tabIndex={-1}
              />
              {archivo ? (
                <div className="ram-archivo">
                  <LuFileText className="ram-archivo-icono" aria-hidden="true" />
                  <span className="ram-archivo-nombre">{archivo.nombre}</span>
                  <Button type="button" variant="secondary" size="sm" icon={LuRefreshCw} onClick={() => archivoRef.current?.click()}>
                    Reemplazar
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={LuTrash2}
                    aria-label={`Quitar ${archivo.nombre}`}
                    onClick={quitarArchivo}
                  >
                    Quitar
                  </Button>
                </div>
              ) : (
                <div className="ram-vacio">
                  <p>Opcional. PDF o imagen de la autorización.</p>
                  <Button type="button" variant="outline" icon={LuPaperclip} onClick={() => archivoRef.current?.click()}>
                    Adjuntar documento
                  </Button>
                </div>
              )}
            </div>

            <p className="ram-registra">
              Se registrará a nombre de <strong>{usuario.nombre}</strong> ({usuario.rol}).
            </p>
          </div>

          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Registrar autorización</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
