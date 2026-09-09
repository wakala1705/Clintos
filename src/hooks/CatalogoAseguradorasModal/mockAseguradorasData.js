// Catálogo de aseguradoras que alimenta @/Components/CatalogoAseguradorasModal
// (búsqueda de "Id. Tercero"/"Id. aseguradora", encargo explícito). Movido acá
// desde mockCirugiaData.js (encargo explícito: "usa el mismo componente de
// programación de cirugía, en el de facturación") -- este catálogo ya no es
// exclusivo de Programación de Sala de Cirugía, lo reusa también
// FacturaEditarModalClasico (Facturación), así que su dato/componente pasan a
// ser app-wide en vez de duplicarse por feature (ver AGENTS.md "Component
// organization": "App-wide components... viven directamente bajo
// src/Components/<ComponentName>/", mismo criterio aplicado acá al hook que
// lo alimenta). La captura de referencia ("Elegir Tercero") es un catálogo
// genérico de terceros (clínicas, personas naturales, entidades públicas...)
// -- acá se recorta a las entidades que genuinamente son aseguradoras/EPS/
// cajas de compensación (varias tomadas literalmente de esa captura, con su
// mismo idTercero/ciudad), que es lo único relevante para este campo.
// `estado` queda sin consumir en el modal (el checkbox "Sólo activos" que lo
// usaba se quitó, encargo explícito) -- se conserva en el dato por si un
// futuro ajuste lo vuelve a necesitar, no es dead data intencional a limpiar
// ahora.
export const ASEGURADORAS_CATALOGO = [
  {
    idTercero: '890918468', razonSocial: 'A&S ASESORES DE SEGUROS LTDA', idCiudad: '05001', ciudad: 'MEDELLIN', estado: 'Activo',
  },
  {
    idTercero: '830113831', razonSocial: 'ALIANSALUD ENTIDAD PROMOTORA DE SALUD S.A', idCiudad: '23001', ciudad: 'MONTERIA', estado: 'Activo',
  },
  {
    idTercero: '900604350', razonSocial: 'ALIANZA MEDELLIN ANTIOQUIA EPS SAS', idCiudad: '05001', ciudad: 'MEDELLIN', estado: 'Activo',
  },
  {
    idTercero: '860027404', razonSocial: 'ALLIANZ SEGUROS DE VIDA S A', idCiudad: '11001', ciudad: 'BOGOTA DC', estado: 'Activo',
  },
  {
    idTercero: '806008394', razonSocial: 'ASOCIACION MUTUAL SER', idCiudad: '23001', ciudad: 'MONTERIA', estado: 'Activo',
  },
  {
    idTercero: '900640334', razonSocial: 'AXA COLPATRIA MEDICINA PREPAGADA S.A.', idCiudad: '11001', ciudad: 'BOGOTA DC', estado: 'Activo',
  },
  {
    idTercero: '860002183', razonSocial: 'AXA COLPATRIA SEGUROS DE VIDA S.A.', idCiudad: '11001', ciudad: 'BOGOTA DC', estado: 'Activo',
  },
  {
    idTercero: '860002184', razonSocial: 'AXA COLPATRIA SEGUROS S.A.', idCiudad: '11001', ciudad: 'BOGOTA DC', estado: 'Inactivo',
  },
  {
    idTercero: '900814916', razonSocial: 'BERKLEY INTERNATIONAL SEGUROS COLOMBIA SA', idCiudad: '11001', ciudad: 'BOGOTA DC', estado: 'Activo',
  },
  {
    idTercero: '901061386', razonSocial: 'BMI COLOMBIA COMPAÑIA DE SEGUROS DE VIDA S.A.', idCiudad: '11001', ciudad: 'BOGOTA DC', estado: 'Activo',
  },
  {
    idTercero: '860066942', razonSocial: 'CAJA DE COMPENSACION FAMILIAR COMPENSAR', idCiudad: '11001', ciudad: 'BOGOTA DC', estado: 'Activo',
  },
  {
    idTercero: '890102044', razonSocial: 'CAJA DE COMPENSACION FAMILIAR DEL ATLANTICO', idCiudad: '08001', ciudad: 'BARRANQUILLA', estado: 'Activo',
  },
  {
    idTercero: '892200015', razonSocial: 'CAJA DE COMPENSACIÓN FAMILIAR DE SUCRE', idCiudad: '70001', ciudad: 'SINCELEJO', estado: 'Activo',
  },
  {
    idTercero: '901543211', razonSocial: 'CAJACOPI EPS S.A.S.', idCiudad: '08001', ciudad: 'BARRANQUILLA', estado: 'Activo',
  },
  {
    idTercero: '900298372', razonSocial: 'CAPITAL SALUD ENTIDAD PROMOTORA DE SALUD DEL REGIMEN SUBSIDIADO S.A.S', idCiudad: '11001', ciudad: 'BOGOTA DC', estado: 'Activo',
  },
  {
    idTercero: '800106339', razonSocial: 'COLMEDICA MEDICINA PREPAGADA S.A.', idCiudad: '11001', ciudad: 'BOGOTA DC', estado: 'Activo',
  },
  {
    idTercero: '890101994', razonSocial: 'COMFAMILIAR ATLANTICO', idCiudad: '08001', ciudad: 'BARRANQUILLA', estado: 'Activo',
  },
  {
    idTercero: '890303093', razonSocial: 'COMFENALCO VALLE EPS', idCiudad: '76001', ciudad: 'CALI', estado: 'Activo',
  },
  {
    idTercero: '860078828', razonSocial: 'COMPAÑIA DE MEDICINA PREPAGADA COLSANITAS S.A.', idCiudad: '11001', ciudad: 'BOGOTA DC', estado: 'Activo',
  },
  {
    idTercero: '860002503', razonSocial: 'COMPAÑIA DE SEGUROS BOLIVAR S.A.', idCiudad: '23001', ciudad: 'MONTERIA', estado: 'Activo',
  },
  {
    idTercero: '800226175', razonSocial: 'COMPAÑIA DE SEGUROS DE VIDA COLMENA S.A', idCiudad: '11001', ciudad: 'BOGOTA DC', estado: 'Inactivo',
  },
  {
    idTercero: '860037013', razonSocial: 'COMPAÑIA MUNDIAL DE SEGUROS S.A.', idCiudad: '11001', ciudad: 'BOGOTA DC', estado: 'Activo',
  },
  {
    idTercero: '805000427', razonSocial: 'COOMEVA ENTIDAD PROMOTORA DE SALUD S.A.', idCiudad: '76001', ciudad: 'CALI', estado: 'Activo',
  },
  {
    idTercero: '805009741', razonSocial: 'COOMEVA MEDICINA PREPAGADA', idCiudad: '76001', ciudad: 'CALI', estado: 'Activo',
  },
  {
    idTercero: '900226715', razonSocial: 'COOSALUD ENTIDAD PROMOTORA DE SALUD S.A.', idCiudad: '13001', ciudad: 'CARTAGENA', estado: 'Activo',
  },
  {
    idTercero: '901021565', razonSocial: 'EMSSANAR ENTIDAD PROMOTORA DE SALUD SAS', idCiudad: '52001', ciudad: 'PASTO', estado: 'Activo',
  },
  {
    idTercero: '830003564', razonSocial: 'ENTIDAD PROMOTORA DE SALUD FAMISANAR SAS', idCiudad: '11001', ciudad: 'BOGOTA DC', estado: 'Activo',
  },
  {
    idTercero: '837000084', razonSocial: 'ENTIDAD PROMOTORA DE SALUD MALLAMAS INDIGENA', idCiudad: '52001', ciudad: 'PASTO', estado: 'Activo',
  },
  {
    idTercero: '800251440', razonSocial: 'ENTIDAD PROMOTORA DE SALUD SANITAS S A S', idCiudad: '11001', ciudad: 'BOGOTA DC', estado: 'Activo',
  },
  {
    idTercero: '805001157', razonSocial: 'ENTIDAD PROMOTORA DE SALUD SERVICIO OCCIDENTAL DE SALUD S.A. S.O.S.', idCiudad: '76001', ciudad: 'CALI', estado: 'Activo',
  },
  {
    idTercero: '901543761', razonSocial: 'EPS FAMILIAR DE COLOMBIA S.A', idCiudad: '70001', ciudad: 'SINCELEJO', estado: 'Inactivo',
  },
  {
    idTercero: '900088702', razonSocial: 'EPS Y MEDICINA PREPAGADA SURAMERICANA S.A.', idCiudad: '05001', ciudad: 'MEDELLIN', estado: 'Activo',
  },
  {
    idTercero: '890903407', razonSocial: 'SEGUROS DE VIDA SURAMERICANA S.A.', idCiudad: '05001', ciudad: 'MEDELLIN', estado: 'Activo',
  },
  {
    idTercero: '800088702', razonSocial: 'NUEVA EPS S.A.', idCiudad: '11001', ciudad: 'BOGOTA DC', estado: 'Activo',
  },
  {
    idTercero: '800130907', razonSocial: 'SALUD TOTAL ENTIDAD PROMOTORA DE SALUD S.A.', idCiudad: '11001', ciudad: 'BOGOTA DC', estado: 'Activo',
  },
];
