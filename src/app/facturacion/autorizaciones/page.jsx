import FacturacionAutorizaciones from '@/Components/FacturacionAutorizaciones/FacturacionAutorizaciones';

// Los filtros del modal de Facturación masiva llegan por query string
// (tercero, regimen, contrato, pyp, desde, hasta).
export default async function FacturacionAutorizacionesPage({ searchParams }) {
  const q = await searchParams;
  const filtros = {};
  ['tercero', 'regimen', 'contrato', 'pyp', 'desde', 'hasta'].forEach((k) => {
    const v = Array.isArray(q[k]) ? q[k][0] : q[k];
    if (v) filtros[k] = v;
  });
  return <FacturacionAutorizaciones filtros={filtros} />;
}
