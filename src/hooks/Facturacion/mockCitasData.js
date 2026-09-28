// Dataset mock para CitaPickerModal (ver ese componente) -- por ahora un
// array estático, no un generador con seed como mockAdmisionesData.js: esta
// primera pasada es solo la ventana visual (encargo explícito), se decide
// volumen/generación real cuando se le dé lógica de verdad.
// TODO: reemplazar por la llamada real al backend.

// "Estado" es solo el estado de facturación de la cita (encargo explícito:
// "cambiemos los estados de 'llego - no llego' por sin facturar, que me
// indica el estado de facturación") -- el estado de llegada ya no vive acá,
// lo indica `horaLlegada` (con valor = llegó, `null` = no llegó, ver
// CitaPickerModal.jsx). Mismo shape/tono/label que ESTADO_FACTURACION de
// FacturasGridClasica (misma feature): "Sin facturar" en warn, "Facturada"
// en success.
export const ESTADO_LABEL = {
  pendiente: 'Sin facturar',
  facturada: 'Facturada',
};

export const ESTADO_TONE = {
  pendiente: 'warn',
  facturada: 'success',
};

// Desglose valorModeradora/valorCompartido/valorCopago/valorExcedente
// (columnas "Vlr moderadora"/"Vlr compartido"/"Vlr copago"/"Vlr excedente",
// encargo explícito: reintroducido tras haberse retirado en una pasada
// anterior -- ver CitaPickerModal.jsx) -- mock: cada cita concentra su
// `valorTotal` en una sola de las 4 categorías (las otras 3 en 0), no hay
// reparto real todavía porque no hay lógica de negocio conectada.
//
// `horaLlegada` (columna "Hora llegada", ver CitaPickerModal.jsx) es ahora
// el único indicador de si el paciente llegó -- valor = llegó (se pinta con
// un Badge verde "Llegada" al lado de la hora, encargo explícito), `null` =
// nunca se presentó (se muestra "—", sin badge). Independiente de `estado`:
// una cita puede estar "Sin facturar" habiendo llegado o no, y una
// "Facturada" siempre trae `horaLlegada` (no se factura sin que el
// paciente haya llegado).
export const CITAS = [
  {
    id: 'cit-1', consecutivo: '0200000657', fecha: '01.09.2026', hora: '09:00', horaLlegada: '08:52', documento: '78708998', nombreAfiliado: 'Medina Villadiego Miguel Antonio', idServicio: '890331C', descripcion: 'Consulta de control o seguimiento', valorTotal: 60000, valorModeradora: 0, valorCompartido: 0, valorCopago: 60000, valorExcedente: 0, estado: 'facturada', tipoSolicitud: 'Telefónica',
  },
  {
    id: 'cit-2', consecutivo: '0200000658', fecha: '01.09.2026', hora: '09:20', horaLlegada: '09:12', documento: '26147772', nombreAfiliado: 'López Sánchez Gloria del Carmen', idServicio: '890231C', descripcion: 'Consulta de primera vez por especialista', valorTotal: 113850, valorModeradora: 113850, valorCompartido: 0, valorCopago: 0, valorExcedente: 0, estado: 'pendiente', tipoSolicitud: 'Telefónica',
  },
  {
    id: 'cit-3', consecutivo: '0200000659', fecha: '01.09.2026', hora: '09:40', horaLlegada: '09:33', documento: '24968586', nombreAfiliado: 'Álvarez Pastrana Juana de Jesús', idServicio: '890302-99C', descripcion: 'Consulta postquirúrgica', valorTotal: 0, valorModeradora: 0, valorCompartido: 0, valorCopago: 0, valorExcedente: 0, estado: 'facturada', tipoSolicitud: 'Web',
  },
  {
    id: 'cit-4', consecutivo: '0200000660', fecha: '01.09.2026', hora: '10:00', horaLlegada: '09:50', documento: '30660218', nombreAfiliado: 'España Herrán Tatiana Lucía', idServicio: '890231C', descripcion: 'Consulta de primera vez por especialista', valorTotal: 35000, valorModeradora: 0, valorCompartido: 35000, valorCopago: 0, valorExcedente: 0, estado: 'facturada', tipoSolicitud: 'Telefónica',
  },
  {
    id: 'cit-5', consecutivo: '0200000661', fecha: '01.09.2026', hora: '10:20', horaLlegada: '10:14', documento: '68695891', nombreAfiliado: 'Arrieta Acosta María Alejandra', idServicio: '890331C', descripcion: 'Consulta de control o seguimiento', valorTotal: 60000, valorModeradora: 0, valorCompartido: 0, valorCopago: 60000, valorExcedente: 0, estado: 'pendiente', tipoSolicitud: 'Telefónica',
  },
  {
    id: 'cit-6', consecutivo: '0200000662', fecha: '01.09.2026', hora: '10:40', horaLlegada: '10:31', documento: '1104406235', nombreAfiliado: 'Cárdenas Guzmán Katerine Paola', idServicio: '890331C', descripcion: 'Consulta de control o seguimiento', valorTotal: 113850, valorModeradora: 113850, valorCompartido: 0, valorCopago: 0, valorExcedente: 0, estado: 'pendiente', tipoSolicitud: 'Presencial',
  },
  {
    id: 'cit-7', consecutivo: '0200000663', fecha: '01.09.2026', hora: '11:00', horaLlegada: '10:57', documento: '2787091', nombreAfiliado: 'Lora Muñoz Luis Enrique', idServicio: '890331C', descripcion: 'Consulta de control o seguimiento', valorTotal: 113850, valorModeradora: 100000, valorCompartido: 0, valorCopago: 0, valorExcedente: 13850, estado: 'facturada', tipoSolicitud: 'Telefónica',
  },
  {
    id: 'cit-8', consecutivo: '0200000664', fecha: '01.09.2026', hora: '11:20', horaLlegada: '11:09', documento: '26134521', nombreAfiliado: 'Páez Rosario Ena del Carmen', idServicio: '890331C', descripcion: 'Consulta de control o seguimiento', valorTotal: 60000, valorModeradora: 0, valorCompartido: 0, valorCopago: 60000, valorExcedente: 0, estado: 'facturada', tipoSolicitud: 'Telefónica',
  },
  {
    id: 'cit-9', consecutivo: '0200000669', fecha: '01.09.2026', hora: '13:00', horaLlegada: '12:52', documento: '35145256', nombreAfiliado: 'Arroyo Avilez Yuvysay María', idServicio: '890302-98C', descripcion: 'Revisión de exámenes', valorTotal: 0, valorModeradora: 0, valorCompartido: 0, valorCopago: 0, valorExcedente: 0, estado: 'pendiente', tipoSolicitud: 'Web',
  },
  {
    id: 'cit-10', consecutivo: '0200000670', fecha: '01.09.2026', hora: '13:20', horaLlegada: '13:09', documento: '26038865', nombreAfiliado: 'González López Paola Isabel', idServicio: '890331C', descripcion: 'Consulta de control o seguimiento', valorTotal: 78985, valorModeradora: 0, valorCompartido: 78985, valorCopago: 0, valorExcedente: 0, estado: 'pendiente', tipoSolicitud: 'Telefónica',
  },
  {
    id: 'cit-11', consecutivo: '0200000671', fecha: '01.09.2026', hora: '13:40', horaLlegada: null, documento: '6882002', nombreAfiliado: 'Rodríguez Rhenals Hugo Alberto', idServicio: '890331C', descripcion: 'Consulta de control o seguimiento', valorTotal: 78985, valorModeradora: 78985, valorCompartido: 0, valorCopago: 0, valorExcedente: 0, estado: 'pendiente', tipoSolicitud: 'Telefónica',
  },
  {
    id: 'cit-12', consecutivo: '0200000672', fecha: '01.09.2026', hora: '14:00', horaLlegada: '13:49', documento: '1072248627', nombreAfiliado: 'Mora Payares Deivi Enrique', idServicio: '890331C', descripcion: 'Consulta de control o seguimiento', valorTotal: 100000, valorModeradora: 0, valorCompartido: 0, valorCopago: 100000, valorExcedente: 0, estado: 'facturada', tipoSolicitud: 'Presencial',
  },
  {
    id: 'cit-13', consecutivo: '0200000673', fecha: '01.09.2026', hora: '14:20', horaLlegada: '14:12', documento: '26173288', nombreAfiliado: 'Botonero Portillo Mercedes', idServicio: '890231C', descripcion: 'Consulta de primera vez por especialista', valorTotal: 113850, valorModeradora: 113850, valorCompartido: 0, valorCopago: 0, valorExcedente: 0, estado: 'pendiente', tipoSolicitud: 'Telefónica',
  },
  {
    id: 'cit-14', consecutivo: '0200000674', fecha: '01.09.2026', hora: '14:40', horaLlegada: null, documento: '50849544', nombreAfiliado: 'Rivero Ávila María de las Mercedes', idServicio: '890331C', descripcion: 'Consulta de control o seguimiento', valorTotal: 60000, valorModeradora: 0, valorCompartido: 0, valorCopago: 60000, valorExcedente: 0, estado: 'pendiente', tipoSolicitud: 'Web',
  },
  {
    id: 'cit-15', consecutivo: '0200000675', fecha: '01.09.2026', hora: '15:00', horaLlegada: '14:47', documento: '21994116', nombreAfiliado: 'Tabares Munera María Dolores', idServicio: '890331C', descripcion: 'Consulta de control o seguimiento', valorTotal: 35000, valorModeradora: 0, valorCompartido: 35000, valorCopago: 0, valorExcedente: 0, estado: 'pendiente', tipoSolicitud: 'Telefónica',
  },
  {
    id: 'cit-16', consecutivo: '0200000692', fecha: '06.09.2026', hora: '13:00', horaLlegada: '12:50', documento: '30060925', nombreAfiliado: 'Jaramillo Bedoya Rebeca María', idServicio: '890231C', descripcion: 'Consulta de primera vez por especialista', valorTotal: 100000, valorModeradora: 100000, valorCompartido: 0, valorCopago: 0, valorExcedente: 0, estado: 'facturada', tipoSolicitud: 'Telefónica',
  },
  {
    id: 'cit-17', consecutivo: '0200000693', fecha: '06.09.2026', hora: '13:20', horaLlegada: '13:08', documento: '1063291309', nombreAfiliado: 'Rivero Andreus Manuela', idServicio: '890331C', descripcion: 'Consulta de control o seguimiento', valorTotal: 60000, valorModeradora: 0, valorCompartido: 0, valorCopago: 60000, valorExcedente: 0, estado: 'pendiente', tipoSolicitud: 'Presencial',
  },
  {
    id: 'cit-18', consecutivo: '0200000697', fecha: '06.09.2026', hora: '14:40', horaLlegada: null, documento: '1073808054', nombreAfiliado: 'Galindo Medina Rafael José', idServicio: '890331C', descripcion: 'Consulta de control o seguimiento', valorTotal: 113850, valorModeradora: 113850, valorCompartido: 0, valorCopago: 0, valorExcedente: 0, estado: 'pendiente', tipoSolicitud: 'Telefónica',
  },
];
