import AtencionPaciente from '@/Components/HistoriaClinica/AtencionPaciente/AtencionPaciente';

// `?tab=<id>` abre la atención directo en esa pestaña, igual que Hospitalización.
export default async function AtencionCirugiaPage({ params, searchParams }) {
  const { id } = await params;
  const { tab } = await searchParams;
  return <AtencionPaciente id={id} variante="cirugia" initialTab={tab} />;
}
