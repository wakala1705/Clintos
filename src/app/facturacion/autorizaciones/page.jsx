import FacturacionAutorizaciones from '@/Components/FacturacionAutorizaciones/FacturacionAutorizaciones';
import { filtrosDesdeQuery } from '@/hooks/FacturacionAutorizaciones/filtrosDesdeQuery';

// Los filtros del modal de Facturación masiva llegan por query string.
export default async function FacturacionAutorizacionesPage({ searchParams }) {
  const filtros = filtrosDesdeQuery(await searchParams);
  return <FacturacionAutorizaciones filtros={filtros} modo="ordenes" />;
}
