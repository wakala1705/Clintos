import FacturacionAutorizaciones from '@/Components/FacturacionAutorizaciones/FacturacionAutorizaciones';
import { filtrosDesdeQuery } from '@/hooks/FacturacionAutorizaciones/filtrosDesdeQuery';

// Facturación de citas: misma pantalla que la de órdenes médicas, sin la
// grilla de detalle. Los filtros del modal llegan por query string.
export default async function FacturacionCitasPage({ searchParams }) {
  const filtros = filtrosDesdeQuery(await searchParams);
  return <FacturacionAutorizaciones filtros={filtros} modo="citas" />;
}
